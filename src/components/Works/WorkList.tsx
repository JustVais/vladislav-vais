import styled from 'styled-components'
import { IWorkItemProps, WorkItem } from './WorkItem'

const myWorks = [
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
    capture: "Онлайн конвертация и деконвертация файлов в DVPL"
  },
  {
    title: "WE-AR",
    capture: "Сервис для создания и отображения AR объектов"
  },
  {
    title: "SnowCredit",
    capture: "Разделы РКО"
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

export const WorkList = () => {
  return (
    <Container>
      {
        myWorks.map((item: IWorkItemProps, index: number) =>
          <WorkItem
            title={item.title}
            capture={item.capture}
            key={index}
          />
        )
      }
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-row-gap: 80px;
`