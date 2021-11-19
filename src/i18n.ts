import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          titles: {
            "/": "Vladislav Vais",
            "/about": "Vladislav Vais | About me",
            "/work": "Vladislav Vais | Work",
            "/contact": "Vladislav Vais | Contact"
          },
          header: {
            "about": "About",
            "work": "Work",
            "contact": "Contact"
          },
          about: {
            about_me: "About me",
            prog_lang: "Programming languages",
            technologies: "Technologies",
            use: "Use",
            familiar: "Familiar",
            experience: "Work experience",
            another: "Another"
          },
          work: {
            much_more: "AND MUCH, MUCH MORE",
            works: [
              {
                title: "SUZ",
                capture: "Leads Management System"
              },
              {
                title: "Canoe",
                capture: "Online store of the clothing brand"
              },
              {
                title: "DVPL converter",
                capture: "Online file conversion to DVPL"
              },
              {
                title: "WE-AR",
                capture: "Service for creating and displaying AR objects"
              },
              {
                title: "SnowCredit",
                capture: "Financial Information Portal"
              },
              {
                title: "Credits Онлайн",
                capture: "Kazakhstan website with articles about credits"
              },
              {
                title: "YSHOP",
                capture: "Collecting information about products for an online store"
              },
            ]
          }
        }
      },
      ru: {
        translation: {
          titles: {
            "/": "Vladislav Vais",
            "/about": "Vladislav Vais | Обо мне",
            "/work": "Vladislav Vais | Работы",
            "/contact": "Vladislav Vais | Контакты"
          },
          header: {
            "about": "Обо мне",
            "work": "Работы",
            "contact": "Контакты"
          },
          about: {
            about_me: "Обо мне",
            prog_lang: "Языки программирования",
            technologies: "Технологии",
            use: "Использую",
            familiar: "Знаком",
            experience: "Опыт работы",
            another: "Другие"
          },
          work: {
            much_more: "И МНОГОЕ, МНОГОЕ ДРУГОЕ",
            works: [
              {
                title: "СУЗ",
                capture: "Система управления заявками"
              },
              {
                title: "Canoe",
                capture: "Интернет магазин бренда одежды"
              },
              {
                title: "DVPL конвертер",
                capture: "Онлайн конвертация файлов в DVPL"
              },
              {
                title: "WE-AR",
                capture: "Сервис для создания и отображения AR объектов"
              },
              {
                title: "SnowCredit",
                capture: "Информационный финансовый портал"
              },
              {
                title: "Кредиты Онлайн",
                capture: "Казахстанский сайт со статьями о кредитах"
              },
              {
                title: "YSHOP",
                capture: "Сбор информации о товарах для интернет магазина"
              },
            ]
          }
        }
      }
    },
    lng: "ru",
    fallbackLng: "ru"
  })