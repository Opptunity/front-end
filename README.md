# RAG (Retrieval-Augmented Generation) Implementation

A complete implementation of RAG system with OpenAI API integration, featuring document processing, vector storage, and conversational AI capabilities.

## 🚀 Features

- **Document Processing**: Automatic chunking and preprocessing of text documents
- **Vector Storage**: ChromaDB integration for efficient similarity search
- **OpenAI Integration**: Seamless integration with OpenAI's GPT models
- **Multiple Document Formats**: Support for TXT, PDF, JSON, and Markdown files
- **Conversational Memory**: Chat with context and conversation history
- **Flexible Architecture**: Modular design for easy customization

## 📋 Requirements

- Python 3.8+
- OpenAI API key
- Required packages (see `requirements.txt`)

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up your OpenAI API key:**
```bash
# Create a .env file
cp .env.example .env

# Edit .env and add your API key
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 Quick Start

### Basic Usage

```python
from openai_rag import OpenAIRAG

# Initialize RAG system
rag = OpenAIRAG(model="gpt-3.5-turbo")

# Add documents
documents = [
    "Your first document content here...",
    "Your second document content here...",
]
rag.add_documents(documents)

# Ask questions
response = rag.chat("What is this document about?")
print(response)
```

### Using Document Loader

```python
from openai_rag import OpenAIRAG
from document_loader import RAGDocumentManager

# Initialize
rag = OpenAIRAG()
doc_manager = RAGDocumentManager(rag)

# Load from various sources
doc_manager.add_file("document.pdf")
doc_manager.add_directory("./docs", recursive=True)
doc_manager.add_from_url("https://example.com/article")

# Query the system
response = rag.chat("Tell me about the documents")
```

### Conversational RAG

```python
from openai_rag import ConversationalRAG

# Initialize with conversation memory
rag = ConversationalRAG(model="gpt-3.5-turbo")

# Add your documents
rag.add_documents(your_documents)

# Chat with history
response1 = rag.chat_with_history("What is machine learning?")
response2 = rag.chat_with_history("Can you give me an example?")  # Remembers context

# Clear history when needed
rag.clear_history()
```

## 📁 Project Structure

```
├── basic_rag.py              # Core RAG implementation without OpenAI
├── openai_rag.py             # RAG with OpenAI integration
├── document_loader.py        # Document loading utilities
├── complete_rag_example.py   # Complete working example
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
└── README.md               # This file
```

## 🔧 Configuration Options

### RAG System Parameters

```python
rag = OpenAIRAG(
    model="gpt-3.5-turbo",           # OpenAI model to use
    temperature=0.7,                  # Response randomness (0-1)
    max_tokens=1000,                 # Maximum response length
    collection_name="my_documents"    # Vector database collection name
)
```

### Document Processing

```python
from basic_rag import DocumentProcessor

processor = DocumentProcessor(
    chunk_size=1000,        # Characters per chunk
    chunk_overlap=200       # Overlap between chunks
)
```

## 🧪 Running the Examples

### Complete Example
```bash
python complete_rag_example.py
```

### Basic RAG (without OpenAI)
```bash
python basic_rag.py
```

### Test Document Loading
```bash
python document_loader.py
```

## 📊 Supported Document Types

| Format | Extension | Description |
|--------|-----------|-------------|
| Text | `.txt`, `.md` | Plain text and Markdown files |
| PDF | `.pdf` | PDF documents (text extraction) |
| JSON | `.json` | JSON files with text content |
| URL | N/A | Web content via HTTP requests |

## 🎛️ Advanced Usage

### Custom System Prompts

```python
custom_prompt = """You are an expert in the domain of the provided documents. 
Answer questions with detailed explanations and cite relevant information."""

response = rag.generate_response(
    query="Your question here",
    system_prompt=custom_prompt
)
```

### Retrieving Context Information

```python
# Get raw context without generating response
context_results = rag.retrieve_context("your query", k=5)

for result in context_results:
    print(f"Relevance: {result['distance']}")
    print(f"Content: {result['text']}")
```

### Collection Management

```python
# Get collection information
info = rag.get_collection_info()
print(f"Documents: {info['document_count']}")

# Access vector store directly
vector_store = rag.vector_store
```

## 🔍 How RAG Works

1. **Document Ingestion**: Documents are split into chunks and converted to embeddings
2. **Vector Storage**: Embeddings are stored in ChromaDB for fast similarity search
3. **Query Processing**: User queries are converted to embeddings
4. **Retrieval**: Most similar document chunks are retrieved
5. **Generation**: Retrieved context is sent to OpenAI with the user query
6. **Response**: AI generates informed response based on retrieved context

## 🚨 Error Handling

The system includes comprehensive error handling:

- **API Key Issues**: Clear error messages for missing/invalid keys
- **Document Loading**: Graceful handling of unsupported formats
- **Network Issues**: Timeout and retry logic for API calls
- **Vector Store**: Automatic collection initialization

## 💡 Tips for Best Results

1. **Document Quality**: Use well-structured, informative documents
2. **Chunk Size**: Adjust based on your document types (500-1500 characters)
3. **Context Amount**: Use 3-5 context chunks for balanced responses
4. **Query Specificity**: More specific questions yield better results
5. **Model Selection**: Use GPT-4 for complex reasoning, GPT-3.5 for speed

## 🔧 Troubleshooting

### Common Issues

**"OpenAI API key not found"**
- Ensure `.env` file exists with `OPENAI_API_KEY=your_key`
- Check that python-dotenv is installed

**"No module named 'chromadb'"**
- Run `pip install -r requirements.txt`

**"Collection already exists"**
- Use different `collection_name` or delete existing collection

**Poor response quality**
- Increase number of retrieved contexts (`context_k`)
- Improve document quality and structure
- Try different chunk sizes

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this RAG implementation!