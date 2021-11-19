import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PageLayout } from '../components/PageLayout'
import { WorkList } from '../components/Works'

export const Work = () => {
  const { t } = useTranslation()

  return (
    <PageLayout>
      <WorkList works={t('work.works', {returnObjects: true})} />
        <AndMore>{t('work.much_more')}</AndMore>
    </PageLayout >
  )
}

const AndMore = styled.span`
  margin-top: 80px;
  font-size: 32px;
  text-align: center;
  font-family: "Eurostile", sans-serif;
`