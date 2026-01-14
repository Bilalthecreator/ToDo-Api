from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Group
from ..schemas import GroupCreate, GroupUpdate, GroupResponse
from ..auth import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_group = Group(name=group.name, user_id=current_user.id)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@router.get("", response_model=List[GroupResponse])
def list_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    groups = db.query(Group).filter(Group.user_id == current_user.id).all()
    return groups

@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return group

@router.put("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_update: GroupUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    group.name = group_update.name
    db.commit()
    db.refresh(group)
    return group

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    db.delete(group)
    db.commit()
    return None