"""
Document Loader Utilities
This module provides utilities for loading various document formats into the RAG system.
"""

import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
import PyPDF2
import requests
from urllib.parse import urlparse


class DocumentLoader:
    """Utility class for loading documents from various sources."""
    
    @staticmethod
    def load_text_file(file_path: str) -> str:
        """Load content from a text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Error loading text file {file_path}: {str(e)}")
    
    @staticmethod
    def load_pdf_file(file_path: str) -> str:
        """Load content from a PDF file."""
        try:
            text_content = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
            return text_content
        except Exception as e:
            raise Exception(f"Error loading PDF file {file_path}: {str(e)}")
    
    @staticmethod
    def load_json_file(file_path: str, text_field: str = "text") -> List[str]:
        """Load content from a JSON file containing documents."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            if isinstance(data, list):
                return [item.get(text_field, str(item)) for item in data]
            elif isinstance(data, dict):
                return [data.get(text_field, str(data))]
            else:
                return [str(data)]
        except Exception as e:
            raise Exception(f"Error loading JSON file {file_path}: {str(e)}")
    
    @staticmethod
    def load_from_url(url: str) -> str:
        """Load content from a URL (text content only)."""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            raise Exception(f"Error loading content from URL {url}: {str(e)}")
    
    @staticmethod
    def load_directory(
        directory_path: str, 
        file_extensions: List[str] = ['.txt', '.md', '.json'],
        recursive: bool = True
    ) -> List[Dict[str, Any]]:
        """Load all supported files from a directory."""
        documents = []
        path = Path(directory_path)
        
        if not path.exists():
            raise Exception(f"Directory does not exist: {directory_path}")
        
        # Get files
        if recursive:
            files = [f for f in path.rglob('*') if f.suffix.lower() in file_extensions]
        else:
            files = [f for f in path.glob('*') if f.suffix.lower() in file_extensions]
        
        for file_path in files:
            try:
                if file_path.suffix.lower() == '.pdf':
                    content = DocumentLoader.load_pdf_file(str(file_path))
                elif file_path.suffix.lower() == '.json':
                    json_docs = DocumentLoader.load_json_file(str(file_path))
                    for i, doc in enumerate(json_docs):
                        documents.append({
                            "content": doc,
                            "metadata": {
                                "source": str(file_path),
                                "type": "json",
                                "index": i
                            }
                        })
                    continue
                else:
                    content = DocumentLoader.load_text_file(str(file_path))
                
                documents.append({
                    "content": content,
                    "metadata": {
                        "source": str(file_path),
                        "type": file_path.suffix.lower(),
                        "size": len(content)
                    }
                })
            except Exception as e:
                print(f"Warning: Could not load {file_path}: {str(e)}")
        
        return documents


class RAGDocumentManager:
    """Manager class for handling documents in RAG systems."""
    
    def __init__(self, rag_system):
        self.rag_system = rag_system
        self.loader = DocumentLoader()
        self.loaded_documents = []
    
    def add_text_documents(self, texts: List[str], metadata: Optional[List[Dict]] = None):
        """Add text documents directly."""
        self.rag_system.add_documents(texts)
        
        # Store metadata for tracking
        for i, text in enumerate(texts):
            doc_meta = metadata[i] if metadata and i < len(metadata) else {}
            self.loaded_documents.append({
                "content": text,
                "metadata": doc_meta,
                "type": "text"
            })
    
    def add_file(self, file_path: str):
        """Add a single file to the RAG system."""
        file_ext = Path(file_path).suffix.lower()
        
        try:
            if file_ext == '.pdf':
                content = self.loader.load_pdf_file(file_path)
            elif file_ext == '.json':
                json_docs = self.loader.load_json_file(file_path)
                self.rag_system.add_documents(json_docs)
                for doc in json_docs:
                    self.loaded_documents.append({
                        "content": doc,
                        "metadata": {"source": file_path, "type": "json"},
                        "type": "file"
                    })
                return
            else:
                content = self.loader.load_text_file(file_path)
            
            self.rag_system.add_documents([content])
            self.loaded_documents.append({
                "content": content,
                "metadata": {"source": file_path, "type": file_ext},
                "type": "file"
            })
            
        except Exception as e:
            print(f"Error adding file {file_path}: {str(e)}")
    
    def add_directory(
        self, 
        directory_path: str, 
        file_extensions: List[str] = ['.txt', '.md', '.json', '.pdf'],
        recursive: bool = True
    ):
        """Add all supported files from a directory."""
        try:
            documents = self.loader.load_directory(
                directory_path, 
                file_extensions, 
                recursive
            )
            
            contents = [doc["content"] for doc in documents]
            self.rag_system.add_documents(contents)
            
            self.loaded_documents.extend(documents)
            print(f"Successfully loaded {len(documents)} documents from {directory_path}")
            
        except Exception as e:
            print(f"Error loading directory {directory_path}: {str(e)}")
    
    def add_from_url(self, url: str):
        """Add content from a URL."""
        try:
            content = self.loader.load_from_url(url)
            self.rag_system.add_documents([content])
            
            self.loaded_documents.append({
                "content": content,
                "metadata": {"source": url, "type": "url"},
                "type": "url"
            })
            
        except Exception as e:
            print(f"Error loading from URL {url}: {str(e)}")
    
    def get_document_stats(self) -> Dict[str, Any]:
        """Get statistics about loaded documents."""
        if not self.loaded_documents:
            return {"total_documents": 0}
        
        stats = {
            "total_documents": len(self.loaded_documents),
            "types": {},
            "total_characters": 0,
            "sources": []
        }
        
        for doc in self.loaded_documents:
            doc_type = doc.get("type", "unknown")
            stats["types"][doc_type] = stats["types"].get(doc_type, 0) + 1
            stats["total_characters"] += len(doc["content"])
            
            source = doc.get("metadata", {}).get("source", "unknown")
            if source not in stats["sources"]:
                stats["sources"].append(source)
        
        return stats


# Example usage
if __name__ == "__main__":
    from openai_rag import OpenAIRAG
    
    # Example of using the document manager
    try:
        # Initialize RAG system
        rag = OpenAIRAG()
        
        # Initialize document manager
        doc_manager = RAGDocumentManager(rag)
        
        # Add sample documents
        sample_docs = [
            "Python is a high-level programming language known for its simplicity and readability.",
            "JavaScript is a versatile programming language primarily used for web development.",
            "Machine learning algorithms can be implemented in various programming languages including Python and R."
        ]
        
        doc_manager.add_text_documents(sample_docs)
        
        # Get stats
        stats = doc_manager.get_document_stats()
        print("Document Statistics:")
        print(json.dumps(stats, indent=2))
        
        # Test query
        response = rag.chat("What programming languages are mentioned?")
        print(f"\nRAG Response: {response}")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure to set your OPENAI_API_KEY environment variable.")