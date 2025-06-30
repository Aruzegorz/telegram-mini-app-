from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models, schemas
from typing import List, Optional

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Telegram Task Scheduler API")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.telegram_id == user.telegram_id).first()
    if db_user:
        return db_user
    new_user = models.User(telegram_id=user.telegram_id, username=user.username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/{telegram_id}", response_model=schemas.User)
def get_user(telegram_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, telegram_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db_task = models.Task(**task.dict(), owner_id=user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[schemas.Task])
def read_tasks(
    telegram_id: int = Query(...),
    completed: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[int] = Query(None, ge=1, le=3),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    query = db.query(models.Task).filter(models.Task.owner_id == user.id)
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    if category:
        query = query.filter(models.Task.category == category)
    if priority:
        query = query.filter(models.Task.priority == priority)
    return query.order_by(models.Task.due_date.asc().nulls_last()).all()

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate, telegram_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, telegram_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return
