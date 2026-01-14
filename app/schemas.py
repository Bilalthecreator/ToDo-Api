from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
import re

# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email format. Email must contain @ and a valid domain')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        # At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
        password_regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
        if not re.match(password_regex, v):
            raise ValueError('Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Group Schemas
class GroupCreate(BaseModel):
    name: str

class GroupUpdate(BaseModel):
    name: str

class GroupResponse(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    group_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    group_id: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    user_id: int
    group_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskWithDetails(TaskResponse):
    group_name: str
    username: str