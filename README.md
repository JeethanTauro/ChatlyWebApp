# Chatly – Real-Time Chat Application

##  Overview

**Chatly** is a **real-time chat application** built with a **Spring Boot backend** and a **React (Vite) frontend**. It supports **WebSocket-based messaging** with STOMP protocol for instant communication. The application is fully containerized with **Docker**, orchestrated via **Docker Compose**, and deployed on **AWS EC2** with **Nginx reverse proxy** handling frontend, API, and WebSocket traffic.

---

## Features

* ⚡ **Real-time chat** using WebSockets (STOMP).
* 🗨️ **Private and group messaging** support.
* 💾 **Persistent H2 database** with Docker volume storage.
* 🐳 **Dockerized setup** using multi-stage builds for both frontend and backend.
* 🌐 **Nginx reverse proxy** for API and WebSocket routing.
* ☁️ **AWS EC2 deployment** 

---

## Architecture

```
User Browser
      │
      ▼
+----------------+
|   Nginx Proxy  |  (Frontend, API, WebSocket Routing)
+----------------+
   │          │
   ▼          ▼
Frontend   Backend (Spring Boot)
(React)       │
              ▼
         H2 Database
```

* **Frontend** served by Nginx (`http://<EC2_IP>/`)
* **Backend API** proxied via Nginx at (`http://<EC2_IP>/api/...`)
* **WebSockets** proxied at (`http://<EC2_IP>/ws/...`)

---

## Tech Stack

* **Frontend:** React (Vite), WebSocket (STOMP)
* **Backend:** Spring Boot, WebSocket, REST APIs
* **Database:** H2 (file-based, persistent via Docker volume)
* **Web Server / Proxy:** Nginx
* **Containerization:** Docker, Docker Compose
* **Cloud Hosting:** AWS EC2

---

## Local Development Setup

### Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)
* Git

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/chatly.git
   cd chatly
   ```

2. **Start services with Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**

   * Frontend: [http://localhost](http://localhost)
   * Backend API (proxied via Nginx): [http://localhost/api](http://localhost/api)
   * WebSocket endpoint: `ws://localhost/ws`

---

## Deployment on AWS EC2

1. **Launch an EC2 instance** (Ubuntu recommended).
2. **Install Docker & Docker Compose**:

   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   sudo systemctl enable docker
   ```
3. **Clone the repository** on the EC2 instance:

   ```bash
   git clone https://github.com/your-username/chatly.git
   cd chatly
   ```
4. **Start the application**:

   ```bash
   docker-compose up -d
   ```
5. **Access from your browser**:

   * `http://<EC2_PUBLIC_IP>` → Chatly frontend
   * `http://<EC2_PUBLIC_IP>/api/...` → Backend REST APIs
   * `ws://<EC2_PUBLIC_IP>/ws` → WebSocket chat

---
