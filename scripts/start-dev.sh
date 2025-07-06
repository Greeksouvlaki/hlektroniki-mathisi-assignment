#!/bin/bash

# Adaptive E-Learning Platform - Development Startup Script

set -e

echo "🚀 Starting Adaptive E-Learning Platform Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check MongoDB
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed. You can use Docker or install MongoDB locally"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
    else
        print_warning "Docker is not installed. Some features may not work"
    fi
    
    print_success "System requirements check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    if [ -d "server" ]; then
        print_status "Installing backend dependencies..."
        cd server
        npm install
        cd ..
        print_success "Backend dependencies installed"
    fi
    
    # Install frontend dependencies
    if [ -d "client" ]; then
        print_status "Installing frontend dependencies..."
        cd client
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
    
    # Install shared dependencies
    if [ -d "shared" ]; then
        print_status "Installing shared dependencies..."
        cd shared
        npm install
        cd ..
        print_success "Shared dependencies installed"
    fi
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ -d "server" ] && [ ! -f "server/.env" ]; then
        if [ -f "server/env.example" ]; then
            cp server/env.example server/.env
            print_success "Backend environment file created"
        else
            print_warning "Backend environment example file not found"
        fi
    fi
    
    # Frontend environment
    if [ -d "client" ] && [ ! -f "client/.env" ]; then
        if [ -f "client/env.example" ]; then
            cp client/env.example client/.env
            print_success "Frontend environment file created"
        else
            print_warning "Frontend environment example file not found"
        fi
    fi
}

# Start MongoDB (if available)
start_mongodb() {
    print_status "Starting MongoDB..."
    
    if command -v mongod &> /dev/null; then
        # Check if MongoDB is already running
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB is already running"
        else
            # Start MongoDB in background
            mongod --dbpath ./data/db &
            sleep 3
            print_success "MongoDB started"
        fi
    elif command -v docker &> /dev/null; then
        # Use Docker MongoDB
        if ! docker ps | grep -q "mongodb"; then
            docker run -d --name mongodb -p 27017:27017 mongo:6
            print_success "MongoDB started in Docker"
        else
            print_success "MongoDB Docker container is already running"
        fi
    else
        print_warning "MongoDB not available. Please start MongoDB manually"
    fi
}

# Start development servers
start_servers() {
    print_status "Starting development servers..."
    
    # Start backend server
    if [ -d "server" ]; then
        print_status "Starting backend server..."
        cd server
        npm run dev &
        BACKEND_PID=$!
        cd ..
        print_success "Backend server started (PID: $BACKEND_PID)"
    fi
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend server
    if [ -d "client" ]; then
        print_status "Starting frontend server..."
        cd client
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        print_success "Frontend server started (PID: $FRONTEND_PID)"
    fi
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
}

# Display startup information
show_info() {
    echo ""
    print_success "🎉 Development environment started successfully!"
    echo ""
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend API: http://localhost:3000"
    echo "📚 API Documentation: http://localhost:3000/api-docs"
    echo "💾 MongoDB: mongodb://localhost:27017"
    echo ""
    echo "📝 Useful commands:"
    echo "  - View logs: tail -f server/logs/app.log"
    echo "  - Stop servers: ./scripts/stop-dev.sh"
    echo "  - Run tests: npm test (in server/ or client/)"
    echo ""
    echo "🛑 Press Ctrl+C to stop all servers"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Shutting down development environment..."
    
    # Stop backend server
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_success "Backend server stopped"
        fi
        rm .backend.pid
    fi
    
    # Stop frontend server
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_success "Frontend server stopped"
        fi
        rm .frontend.pid
    fi
    
    # Stop MongoDB if started by this script
    if pgrep -x "mongod" > /dev/null; then
        pkill mongod
        print_success "MongoDB stopped"
    fi
    
    print_success "Development environment shutdown complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    echo "=========================================="
    echo "  Adaptive E-Learning Platform"
    echo "  Development Environment Setup"
    echo "=========================================="
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    start_mongodb
    start_servers
    show_info
    
    # Wait for user interrupt
    wait
}

# Run main function
main 