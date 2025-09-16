"""
Basic RAG Implementation
This module provides a simple RAG system that can process documents,
create embeddings, and perform retrieval-augmented generation.
"""

import os
import json
from typing import List, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings


class DocumentProcessor:
    """Handles document processing and chunking."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - self.chunk_overlap
            
        return chunks
    
    def process_documents(self, documents: List[str]) -> List[Dict[str, Any]]:
        """Process a list of documents into chunks with metadata."""
        processed_docs = []
        
        for doc_id, document in enumerate(documents):
            chunks = self.chunk_text(document)
            
            for chunk_id, chunk in enumerate(chunks):
                processed_docs.append({
                    "id": f"doc_{doc_id}_chunk_{chunk_id}",
                    "text": chunk,
                    "doc_id": doc_id,
                    "chunk_id": chunk_id,
                    "metadata": {
                        "document_id": doc_id,
                        "chunk_id": chunk_id,
                        "length": len(chunk)
                    }
                })
        
        return processed_docs


class VectorStore:
    """Manages vector embeddings and similarity search."""
    
    def __init__(self, collection_name: str = "rag_documents"):
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.Client(Settings(anonymized_telemetry=False))
        self.collection_name = collection_name
        self.collection = None
        self._initialize_collection()
    
    def _initialize_collection(self):
        """Initialize or get the ChromaDB collection."""
        try:
            self.collection = self.client.get_collection(self.collection_name)
        except:
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to the vector store."""
        texts = [doc["text"] for doc in documents]
        embeddings = self.embedding_model.encode(texts).tolist()
        
        ids = [doc["id"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]
        
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"Added {len(documents)} documents to vector store")
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=k
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                "id": results['ids'][0][i],
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i]
            })
        
        return formatted_results


class BasicRAG:
    """Basic RAG system without external LLM API."""
    
    def __init__(self, collection_name: str = "rag_documents"):
        self.document_processor = DocumentProcessor()
        self.vector_store = VectorStore(collection_name)
    
    def add_documents(self, documents: List[str]):
        """Add documents to the RAG system."""
        processed_docs = self.document_processor.process_documents(documents)
        self.vector_store.add_documents(processed_docs)
    
    def retrieve_context(self, query: str, k: int = 3) -> str:
        """Retrieve relevant context for a query."""
        results = self.vector_store.similarity_search(query, k=k)
        
        context_parts = []
        for result in results:
            context_parts.append(f"Document {result['metadata']['document_id']}: {result['text']}")
        
        return "\n\n".join(context_parts)
    
    def generate_prompt(self, query: str, context: str) -> str:
        """Generate a prompt with context for any LLM."""
        prompt = f"""Context information:
{context}

Question: {query}

Please answer the question based on the context provided above. If the context doesn't contain enough information to answer the question, please say so.

Answer:"""
        return prompt


# Example usage
if __name__ == "__main__":
    # Sample documents
    documents = [
        "Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines. It has become an essential part of the technology industry.",
        "Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed.",
        "Deep Learning is a subset of machine learning that uses neural networks with multiple layers to analyze data and make predictions.",
        "Natural Language Processing (NLP) is a field of AI that focuses on the interaction between computers and human language.",
        "Computer Vision is an AI field that enables computers to interpret and understand visual information from the world."
    ]
    
    # Initialize RAG system
    rag = BasicRAG("example_collection")
    
    # Add documents
    rag.add_documents(documents)
    
    # Example query
    query = "What is machine learning?"
    context = rag.retrieve_context(query)
    prompt = rag.generate_prompt(query, context)
    
    print("Generated Prompt:")
    print("=" * 50)
    print(prompt)