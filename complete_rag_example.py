"""
Complete RAG Example
This is a comprehensive example showing how to use the RAG system with OpenAI API.
"""

import os
from dotenv import load_dotenv
from openai_rag import OpenAIRAG, ConversationalRAG
from document_loader import RAGDocumentManager

# Load environment variables
load_dotenv()


def main():
    """Main function demonstrating RAG usage."""
    
    print("🤖 RAG System with OpenAI Integration")
    print("=" * 50)
    
    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables.")
        print("Please create a .env file with your OpenAI API key:")
        print("OPENAI_API_KEY=your_api_key_here")
        return
    
    try:
        # Initialize RAG system
        print("🔧 Initializing RAG system...")
        rag = ConversationalRAG(
            model="gpt-3.5-turbo",
            temperature=0.7,
            max_tokens=500
        )
        
        # Initialize document manager
        doc_manager = RAGDocumentManager(rag)
        
        # Sample knowledge base about AI and programming
        knowledge_base = [
            """
            Python Programming Language:
            Python is a high-level, interpreted programming language with dynamic semantics. 
            Its high-level built-in data structures, combined with dynamic typing and dynamic binding, 
            make it very attractive for Rapid Application Development, as well as for use as a scripting 
            or glue language to connect existing components together. Python's simple, easy to learn 
            syntax emphasizes readability and therefore reduces the cost of program maintenance.
            """,
            """
            Machine Learning with Python:
            Python has become the go-to language for machine learning due to its extensive ecosystem 
            of libraries and frameworks. Key libraries include NumPy for numerical computing, Pandas 
            for data manipulation, Scikit-learn for traditional machine learning algorithms, TensorFlow 
            and PyTorch for deep learning. The language's simplicity allows data scientists to focus 
            on solving problems rather than dealing with complex syntax.
            """,
            """
            Web Development with Python:
            Python offers several frameworks for web development. Django is a high-level framework 
            that encourages rapid development and clean, pragmatic design. Flask is a lightweight 
            framework that gives developers more control and flexibility. FastAPI is a modern framework 
            for building APIs with Python 3.6+ based on standard Python type hints. These frameworks 
            make it easy to build scalable web applications.
            """,
            """
            Data Science and Analytics:
            Python is widely used in data science for data analysis, visualization, and statistical 
            modeling. Libraries like Matplotlib and Seaborn are used for data visualization, while 
            SciPy provides scientific computing capabilities. Jupyter Notebooks provide an interactive 
            environment for data exploration and analysis. The combination of these tools makes Python 
            an excellent choice for data science projects.
            """,
            """
            Artificial Intelligence and Deep Learning:
            Python's role in AI development is significant due to its extensive library ecosystem. 
            TensorFlow and Keras provide high-level APIs for building neural networks. PyTorch offers 
            dynamic computation graphs and is popular in research. OpenAI's GPT models can be accessed 
            through Python APIs. Computer vision tasks can be handled with OpenCV, while natural 
            language processing can be done with NLTK, spaCy, and Transformers library.
            """
        ]
        
        print("📚 Adding documents to knowledge base...")
        doc_manager.add_text_documents(knowledge_base)
        
        # Display document statistics
        stats = doc_manager.get_document_stats()
        print(f"✅ Loaded {stats['total_documents']} documents")
        print(f"📊 Total characters: {stats['total_characters']:,}")
        
        # Get collection info
        collection_info = rag.get_collection_info()
        print(f"🗃️  Collection: {collection_info.get('collection_name', 'N/A')}")
        print(f"📄 Document chunks: {collection_info.get('document_count', 'N/A')}")
        
        print("\n" + "=" * 50)
        print("🔍 Testing RAG System with Sample Queries")
        print("=" * 50)
        
        # Sample queries to test the system
        test_queries = [
            "What is Python and why is it popular?",
            "What are the main Python libraries for machine learning?",
            "How can I use Python for web development?",
            "What makes Python good for data science?",
            "Tell me about AI development with Python"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🤔 Query {i}: {query}")
            print("-" * 40)
            
            # Get response with context
            response = rag.chat_with_history(query, context_k=2)
            print(f"🤖 Answer: {response['answer']}")
            
            # Show usage statistics
            usage = response.get('usage', {})
            if usage:
                print(f"📊 Tokens: {usage.get('total_tokens', 'N/A')} "
                      f"(prompt: {usage.get('prompt_tokens', 'N/A')}, "
                      f"completion: {usage.get('completion_tokens', 'N/A')})")
        
        print("\n" + "=" * 50)
        print("💬 Interactive Chat Mode")
        print("Type 'quit' to exit, 'clear' to clear history")
        print("=" * 50)
        
        # Interactive chat loop
        while True:
            try:
                user_input = input("\n🙋 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break
                
                if user_input.lower() == 'clear':
                    rag.clear_history()
                    continue
                
                if not user_input:
                    continue
                
                print("🤖 Assistant: ", end="")
                response = rag.chat_with_history(user_input, context_k=3)
                print(response['answer'])
                
                # Show token usage for interactive mode
                usage = response.get('usage', {})
                if usage:
                    print(f"   💡 Tokens used: {usage.get('total_tokens', 'N/A')}")
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {str(e)}")
    
    except Exception as e:
        print(f"❌ Error initializing RAG system: {str(e)}")
        print("Please check your OpenAI API key and internet connection.")


if __name__ == "__main__":
    main()