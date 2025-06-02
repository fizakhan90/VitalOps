# 1. Base image
FROM python:3.10-slim 
# Or your preferred Python version

# 2. Set working directory
WORKDIR /app

# 3. Copy dependency file
COPY requirements.txt .

# 4. Install dependencies
RUN pip install --no-cache-dir --trusted-host pypi.python.org -r requirements.txt

# 5. Copy application code (including the 'static' folder if it exists here and you serve from it)
COPY . .

# 6. Expose port
EXPOSE 5000

# 7. Run command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]