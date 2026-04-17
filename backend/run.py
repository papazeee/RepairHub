import argparse
import os

import uvicorn


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    args = parser.parse_args()

    try:
        port = int(os.getenv("PORT", "8000"))
        uvicorn.run("main:app", host="0.0.0.0", port=port, reload=args.reload)
    except KeyboardInterrupt:
        pass