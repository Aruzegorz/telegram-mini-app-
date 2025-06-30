from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = "Общее"
    priority: Optional[int] = Field(2, ge=1, le=3)
    due_date: Optional[datetime] = None
    completed: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True
