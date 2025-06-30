import logging
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Updater, CommandHandler, CallbackContext

TOKEN = "8086946353:AAHIQLj2cwFccb5cpELEOGg4cQHxexeKdDI"
API_URL = "https://aruzegorz.github.io/telegram-mini-app-/"  # Адрес backend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def start(update: Update, context: CallbackContext):
    user = update.effective_user
    # Регистрируем пользователя в backend
    try:
        requests.post(f"{API_URL}/users/", json={"telegram_id": user.id, "username": user.username})
    except Exception as e:
        logger.error(f"Ошибка регистрации пользователя: {e}")

    keyboard = [
        [InlineKeyboardButton("Открыть планировщик задач", web_app=WebAppInfo(url="https://yourfrontenddomain.com"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text(f"Привет, {user.first_name}! Нажми кнопку, чтобы открыть планировщик задач.", reply_markup=reply_markup)

def main():
    updater = Updater(TOKEN)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
