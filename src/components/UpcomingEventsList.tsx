// Libraries
import React, { useEffect, useState } from "react"
import styled from "styled-components"

// Components
import EventCard from "./EventCard"
import InfoBanner from "./InfoBanner"
import Link from "./Link"
import Translation from "./Translation"
import ButtonLink from "./ButtonLink"

// Data
import events from "../data/community-events.json"

interface RawCommunityEvent {
  title: string
  to: string
  sponsor: string | null
  location: string
  description: string
  startDate: string
  endDate: string
}

interface CommunityEvent extends RawCommunityEvent {
  date: string
  formattedDetails: string
}

const EventList = styled.div`
  /* Adding direction ltr as a temporary fix to styling bug */
  /* https://github.com/ethereum/ethereum-org-website/issues/6221 */
  direction: ltr;
  width: 100%;
  margin: 30px auto;
  position: relative;
  padding: 0 10px;
  -webkit-transition: all 0.4s ease;
  -moz-transition: all 0.4s ease;
  -ms-transition: all 0.4s ease;
  transition: all 0.4s ease;

  &:before {
    content: "";
    width: 3px;
    height: 100%;
    background: ${(props) => props.theme.colors.primary};
    left: 50%;
    top: 0;
    position: absolute;
  }

  &:after {
    content: "";
    clear: both;
    display: table;
    width: 100%;
  }
`

const ButtonLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  max-width: 620px;
  margin-top: 1.25rem;
`

export interface IProps {}

const UpcomingEventsList: React.FC<IProps> = () => {
  const eventsPerLoad = 10
  const [orderedUpcomingEvents, setOrderedUpcomingEvents] = useState<
    Array<CommunityEvent>
  >([])
  const [maxRange, setMaxRange] = useState(eventsPerLoad)
  const [isVisible, setIsVisible] = useState(true)

  // Create Date object from each YYYY-MM-DD JSON date string
  const dateParse = (dateString: string) => {
    const parts = dateString.split("-")
    return new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    )
  }

  useEffect(() => {
    const eventsList: Array<RawCommunityEvent> = [...events]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Remove events that have ended
    const upcomingEvents = eventsList.filter(({ endDate }) => {
      return dateParse(endDate) > yesterday
    })

    // Sort events by start date
    const orderedEvents = upcomingEvents.sort(
      (a: RawCommunityEvent, b: RawCommunityEvent) =>
        dateParse(a.startDate).getTime() - dateParse(b.startDate).getTime()
    )

    // Add formatted string to display
    const formattedEvents = orderedEvents.map((event) => {
      const dateRange =
        event.startDate === event.endDate
          ? dateParse(event.startDate).toLocaleDateString()
          : `${dateParse(event.startDate).toLocaleDateString()} - ${dateParse(
              event.endDate
            ).toLocaleDateString()}`

      const details = `${event.sponsor ? "(" + event.sponsor + ")" : ""} ${
        event.description
      }`

      return {
        ...event,
        date: dateRange,
        formattedDetails: details,
      }
    })

    setOrderedUpcomingEvents(formattedEvents)
  }, [])

  const loadMoreEvents = () => {
    setMaxRange((counter) => counter + eventsPerLoad)
    setIsVisible(maxRange + eventsPerLoad <= orderedUpcomingEvents?.length)
  }

  if (orderedUpcomingEvents?.length === 0) {
    return (
      <InfoBanner emoji=":information_source:">
        <Translation id="page-community-upcoming-events-no-events" />{" "}
        <Link to="https://github.com/ethereum/ethereum-org-website/blob/dev/src/data/community-events.json">
          <Translation id="page-community-please-add-to-page" />
        </Link>
      </InfoBanner>
    )
  }

  return (
    <>
      <EventList>
        {orderedUpcomingEvents
          ?.slice(0, maxRange)
          .map(({ title, to, formattedDetails, date, location }, idx) => {
            return (
              <EventCard
                key={idx}
                title={title}
                to={to}
                date={date}
                description={formattedDetails}
                location={location}
                isEven={(idx + 1) % 2 === 0}
              />
            )
          })}
      </EventList>
      <ButtonLinkContainer>
        {isVisible && (
          <ButtonLink onClick={loadMoreEvents}>
            <Translation id="page-community-upcoming-events-load-more" />
          </ButtonLink>
        )}
      </ButtonLinkContainer>
    </>
  )
}

export default UpcomingEventsList
