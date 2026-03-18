pub trait EventStore {
    type EventId;
    type Event;
    type Result<T>;

    fn write_event(&self, ev: &Self::Event) -> Self::Result<Self::EventId>;
    fn unprocessed_events(
        &self,
    ) -> Self::Result<impl Iterator<Item = Self::Result<(Self::EventId, Self::Event)>>>;
}

pub trait EventProcessor {
    type EventId;
    type Event;
    type Effect;
    type EventStore: EventStore;
    type Result<T>;

    fn process_event(
        &self,
        event_id: &Self::EventId,
        event: &Self::Event,
        store: &Self::EventStore,
    ) -> Self::Result<Vec<Self::Effect>>;
}
