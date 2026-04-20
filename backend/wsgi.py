"""
Production entry point for Railway.
Uvicorn will be invoked directly without if __name__ == "__main__".
"""
import os
import uvicorn

# This file is imported directly, so the app starts immediately.
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Never auto-reload in production
    )
