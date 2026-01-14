# ToDo API - Task Management System

A RESTful API built with FastAPI for managing tasks with group organization and user authentication.

## 🌐 Live Demo

**Deployed Application:** [https://todo-api-lu26.onrender.com](https://todo-api-lu26.onrender.com)



## ✨ Features

### Core Features (All Implemented)
- ✅ **User Authentication** - JWT-based registration and login with bcrypt password hashing
- ✅ **Task Management** - Full CRUD operations on tasks
- ✅ **Group Organization** - Create and manage task groups
- ✅ **Task Filtering** - Filter by group ID and completion status
- ✅ **Mark Complete/Incomplete** - Toggle task completion status
- ✅ **SQLAlchemy ORM** - All models and queries use SQLAlchemy
- ✅ **Database Relationships** - User→Tasks, User→Groups, Group→Tasks (one-to-many)
- ✅ **Access Control** - Users can only manage their own tasks and groups
- ✅ **Web Interface** - Responsive HTML/CSS/JS frontend
- ✅ **Auto API Docs** - OpenAPI/Swagger documentation

### Not Implemented
- ❌ Alembic migrations
- ❌ LLM integration

## 🛠️ Technology Stack

- **Framework:** FastAPI 0.115.0
- **Database:** SQLite (both development and production)
- **ORM:** SQLAlchemy 2.0.36
- **Authentication:** JWT (python-jose) + bcrypt
- **Server:** Uvicorn
- **Deployment:** Render (Free Tier)

## 🚀 Local Setup

### Prerequisites
- Python 3.9+
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fa21-bcs-002-code/ToDo-Api.git
   cd ToDo-Api
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Access the application**
   - Web Interface: http://127.0.0.1:8000

## 📚 API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login and get JWT token |

### Groups (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create new group |
| GET | `/api/groups` | Get all user's groups |
| GET | `/api/groups/{id}` | Get specific group |
| PUT | `/api/groups/{id}` | Update group |
| DELETE | `/api/groups/{id}` | Delete group |

### Tasks (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks` | Get all tasks (with filters) |
| GET | `/api/tasks/{id}` | Get specific task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

### Query Parameters
- Filter by group: `/api/tasks?group_id=1`
- Filter by completion: `/api/tasks?completed=true`
- Combine filters: `/api/tasks?group_id=1&completed=false`

## 🔌 Usage Examples

### Register User
```bash
curl -X POST "https://todo-api-lu26.onrender.com/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST "https://todo-api-lu26.onrender.com/api/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=password123"
```

### Create Group (requires token)
```bash
curl -X POST "https://todo-api-lu26.onrender.com/api/groups" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Work Projects"}'
```

### Create Task (requires token)
```bash
curl -X POST "https://todo-api-lu26.onrender.com/api/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete assignment",
    "description": "Finish ToDo API",
    "group_id": 1
  }'
```

### Get Filtered Tasks
```bash
# Get incomplete tasks in group 1
curl -X GET "https://todo-api-lu26.onrender.com/api/tasks?group_id=1&completed=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Models

### User
- `id` - Integer (Primary Key)
- `username` - String (Unique, Required)
- `email` - String (Unique, Required)
- `password_hash` - String (Required)
- `created_at` - DateTime

### Group
- `id` - Integer (Primary Key)
- `name` - String (Required)
- `user_id` - Integer (Foreign Key → User)
- `created_at` - DateTime
- `updated_at` - DateTime

### Task
- `id` - Integer (Primary Key)
- `title` - String (Required)
- `description` - Text (Optional)
- `is_completed` - Boolean (Default: False)
- `user_id` - Integer (Foreign Key → User)
- `group_id` - Integer (Foreign Key → Group)
- `created_at` - DateTime
- `updated_at` - DateTime

## 🚢 Deployment

### Deployed on Render (Free Tier)

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Deploy Your Own

1. Push code to GitHub
2. Sign up on [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Deploy

**Note:** Free tier apps spin down after 15 minutes of inactivity. First request may take 30-60 seconds.

## 🔐 Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- Protected routes require valid tokens
- Users can only access their own resources

## 📦 Dependencies

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
pydantic==2.10.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.2.1
python-multipart==0.0.12
jinja2==3.1.4
aiofiles==24.1.0
```

## 📝 Assignment Completion Status

### Core Requirements ✅
- [x] SQLAlchemy ORM for all models and queries
- [x] CRUD operations on tasks
- [x] Mark tasks complete/incomplete
- [x] Task groups with proper relationships
- [x] Database relationships (User→Tasks, User→Groups, Group→Tasks)
- [x] User authentication (register, login with JWT)
- [x] Secure password hashing
- [x] Users manage only their own resources
- [x] Task filtering by group and completion status

### Optional Features
- [x] Deployment with live URL
- [x] Bonus queries (filter by group and completion)
- [ ] Alembic migrations (not implemented)
- [ ] LLM integration (not implemented)

## 👤 Author

**Bilal Ahmed**


## 📄 License

This project was created as part of a backend developer assignment.

---

**Live URL:** https://todo-api-lu26.onrender.com


