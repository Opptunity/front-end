"""
RAG Implementation with OpenAI API Integration
This module provides a complete RAG system integrated with OpenAI's API.
"""

import os
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import openai
from basic_rag import DocumentProcessor, VectorStore

# Load environment variables
load_dotenv()


class OpenAIRAG:
    """RAG system integrated with OpenAI API."""
    
    def __init__(
        self, 
        openai_api_key: Optional[str] = None,
        model: str = "gpt-3.5-turbo",
        collection_name: str = "openai_rag_documents",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ):
        # Initialize OpenAI client
        self.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it directly.")
        
        self.client = openai.OpenAI(api_key=self.api_key)
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        # Initialize RAG components
        self.document_processor = DocumentProcessor()
        self.vector_store = VectorStore(collection_name)
    
    def add_documents(self, documents: List[str]):
        """Add documents to the RAG system."""
        processed_docs = self.document_processor.process_documents(documents)
        self.vector_store.add_documents(processed_docs)
        print(f"Successfully added {len(documents)} documents to the knowledge base.")
    
    def retrieve_context(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant context for a query."""
        return self.vector_store.similarity_search(query, k=k)
    
    def format_context(self, context_results: List[Dict[str, Any]]) -> str:
        """Format retrieved context for the prompt."""
        if not context_results:
            return "No relevant context found."
        
        formatted_context = []
        for i, result in enumerate(context_results, 1):
            formatted_context.append(
                f"[Context {i}]\n{result['text']}\n"
            )
        
        return "\n".join(formatted_context)
    
    def generate_response(
        self, 
        query: str, 
        context_k: int = 3,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a response using RAG with OpenAI."""
        
        # Retrieve relevant context
        context_results = self.retrieve_context(query, k=context_k)
        formatted_context = self.format_context(context_results)
        
        # Default system prompt
        if system_prompt is None:
            system_prompt = """You are a helpful AI assistant that answers questions based on the provided context. 
Use the context information to provide accurate and detailed answers. If the context doesn't contain 
enough information to fully answer the question, acknowledge this and provide what information you can 
based on the available context."""
        
        # Create the user prompt with context
        user_prompt = f"""Context Information:
{formatted_context}

Question: {query}

Please provide a comprehensive answer based on the context above."""
        
        try:
            # Make API call to OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            answer = response.choices[0].message.content
            
            return {
                "query": query,
                "answer": answer,
                "context_used": context_results,
                "model": self.model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
            
        except Exception as e:
            return {
                "query": query,
                "answer": f"Error generating response: {str(e)}",
                "context_used": context_results,
                "error": str(e)
            }
    
    def chat(self, query: str, context_k: int = 3) -> str:
        """Simple chat interface that returns just the answer."""
        result = self.generate_response(query, context_k=context_k)
        return result.get("answer", "Sorry, I couldn't generate a response.")
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the current document collection."""
        try:
            collection_count = self.vector_store.collection.count()
            return {
                "collection_name": self.vector_store.collection_name,
                "document_count": collection_count,
                "model": self.model
            }
        except Exception as e:
            return {"error": f"Could not retrieve collection info: {str(e)}"}


class ConversationalRAG(OpenAIRAG):
    """Extended RAG system with conversation memory."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.conversation_history = []
    
    def chat_with_history(
        self, 
        query: str, 
        context_k: int = 3,
        max_history: int = 5
    ) -> Dict[str, Any]:
        """Chat with conversation history."""
        
        # Retrieve relevant context
        context_results = self.retrieve_context(query, k=context_k)
        formatted_context = self.format_context(context_results)
        
        # Build messages with history
        messages = [
            {
                "role": "system", 
                "content": """You are a helpful AI assistant that answers questions based on provided context 
and conversation history. Use both the context information and previous conversation to provide 
accurate and coherent responses."""
            }
        ]
        
        # Add recent conversation history
        recent_history = self.conversation_history[-max_history:] if self.conversation_history else []
        for entry in recent_history:
            messages.extend([
                {"role": "user", "content": entry["query"]},
                {"role": "assistant", "content": entry["answer"]}
            ])
        
        # Add current query with context
        current_prompt = f"""Context Information:
{formatted_context}

Question: {query}"""
        
        messages.append({"role": "user", "content": current_prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            answer = response.choices[0].message.content
            
            # Add to conversation history
            self.conversation_history.append({
                "query": query,
                "answer": answer,
                "context_used": len(context_results)
            })
            
            return {
                "query": query,
                "answer": answer,
                "context_used": context_results,
                "conversation_turn": len(self.conversation_history),
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
            
        except Exception as e:
            return {
                "query": query,
                "answer": f"Error generating response: {str(e)}",
                "error": str(e)
            }
    
    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        print("Conversation history cleared.")


# Example usage and testing
if __name__ == "__main__":
    # Sample documents about AI and technology
    sample_documents = [
        """
        Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines 
        capable of performing tasks that typically require human intelligence. These tasks include learning, 
        reasoning, problem-solving, perception, and language understanding. AI has become increasingly important 
        in various industries including healthcare, finance, transportation, and entertainment.
        """,
        """
        Machine Learning is a subset of AI that enables computers to learn and improve from experience without 
        being explicitly programmed. It uses algorithms and statistical models to analyze and draw inferences 
        from patterns in data. Common types include supervised learning, unsupervised learning, and reinforcement 
        learning. Popular algorithms include linear regression, decision trees, neural networks, and support vector machines.
        """,
        """
        Deep Learning is a subset of machine learning that uses artificial neural networks with multiple layers 
        (hence "deep") to progressively extract higher-level features from raw input. It has been particularly 
        successful in areas such as image recognition, natural language processing, and speech recognition. 
        Deep learning models require large amounts of data and computational power to train effectively.
        """,
        """
        Natural Language Processing (NLP) is a field of AI that focuses on the interaction between computers 
        and human language. It involves developing algorithms and models that can understand, interpret, and 
        generate human language in a valuable way. Applications include machine translation, sentiment analysis, 
        chatbots, and text summarization. Modern NLP heavily relies on transformer architectures and large language models.
        """,
        """
        Computer Vision is an interdisciplinary field that deals with how computers can be made to gain 
        high-level understanding from digital images or videos. It seeks to automate tasks that the human 
        visual system can do. Applications include facial recognition, medical image analysis, autonomous 
        vehicles, and quality control in manufacturing. Convolutional Neural Networks (CNNs) are commonly used in computer vision tasks.
        """
    ]
    
    # Example usage (requires OPENAI_API_KEY environment variable)
    try:
        # Initialize RAG system
        rag = OpenAIRAG(model="gpt-3.5-turbo")
        
        # Add documents
        rag.add_documents(sample_documents)
        
        # Get collection info
        info = rag.get_collection_info()
        print(f"Collection Info: {info}")
        
        # Example queries
        test_queries = [
            "What is machine learning?",
            "How does deep learning work?",
            "What are the applications of computer vision?"
        ]
        
        for query in test_queries:
            print(f"\nQuery: {query}")
            print("-" * 50)
            response = rag.generate_response(query)
            print(f"Answer: {response['answer']}")
            print(f"Tokens used: {response.get('usage', {}).get('total_tokens', 'N/A')}")
            
    except ValueError as e:
        print(f"Setup Error: {e}")
        print("Please set your OPENAI_API_KEY environment variable to test the OpenAI integration.")