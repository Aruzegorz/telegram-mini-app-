# Планировщик задач для Telegram

## Описание

Миниаппс для Telegram с планировщиком задач: создание, редактирование, фильтрация, удаление.

## Запуск backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
uvicorn main:app --reload
