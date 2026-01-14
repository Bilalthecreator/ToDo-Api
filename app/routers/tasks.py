from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import User, Task, Group
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, TaskWithDetails
from ..auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify group belongs to user
    group = db.query(Group).filter(
        Group.id == task.group_id,
        Group.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    new_task = Task(
        title=task.title,
        description=task.description,
        user_id=current_user.id,
        group_id=task.group_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("", response_model=List[TaskWithDetails])
def list_tasks(
    group_id: Optional[int] = Query(None, alias="group"),
    completed: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        Task,
        Group.name.label("group_name"),
        User.username.label("username")
    ).join(Group, Task.group_id == Group.id).join(
        User, Task.user_id == User.id
    ).filter(Task.user_id == current_user.id)
    
    if group_id is not None:
        query = query.filter(Task.group_id == group_id)
    
    if completed is not None:
        query = query.filter(Task.is_completed == completed)
    
    results = query.all()
    
    tasks_with_details = []
    for task, group_name, username in results:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_completed": task.is_completed,
            "user_id": task.user_id,
            "group_id": task.group_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "group_name": group_name,
            "username": username
        }
        tasks_with_details.append(task_dict)
    
    return tasks_with_details

@router.get("/{task_id}", response_model=TaskWithDetails)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = db.query(
        Task,
        Group.name.label("group_name"),
        User.username.label("username")
    ).join(Group, Task.group_id == Group.id).join(
        User, Task.user_id == User.id
    ).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task, group_name, username = result
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "is_completed": task.is_completed,
        "user_id": task.user_id,
        "group_id": task.group_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "group_name": group_name,
        "username": username
    }

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.is_completed is not None:
        task.is_completed = task_update.is_completed
    if task_update.group_id is not None:
        group = db.query(Group).filter(
            Group.id == task_update.group_id,
            Group.user_id == current_user.id
        ).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        task.group_id = task_update.group_id
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    return None