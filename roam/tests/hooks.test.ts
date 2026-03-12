import { useTourStore } from '../store/tourStore'
import { COLABA_STOPS } from '../constants/config'

describe('tourStore', () => {
  beforeEach(() => {
    useTourStore.getState().resetTour()
  })

  it('should initialize with empty state', () => {
    const state = useTourStore.getState()
    expect(state.stops).toEqual([])
    expect(state.currentStopIndex).toBe(0)
    expect(state.completedStops).toEqual([])
  })

  it('should set stops', () => {
    useTourStore.getState().setStops(COLABA_STOPS)
    const state = useTourStore.getState()
    expect(state.stops).toHaveLength(5)
    expect(state.currentStopIndex).toBe(0)
  })

  it('should advance to next stop', () => {
    useTourStore.getState().setStops(COLABA_STOPS)
    useTourStore.getState().nextStop()
    expect(useTourStore.getState().currentStopIndex).toBe(1)
  })

  it('should not advance past last stop', () => {
    useTourStore.getState().setStops(COLABA_STOPS)
    for (let i = 0; i < 10; i++) {
      useTourStore.getState().nextStop()
    }
    expect(useTourStore.getState().currentStopIndex).toBe(4)
  })

  it('should complete current stop', () => {
    useTourStore.getState().setStops(COLABA_STOPS)
    useTourStore.getState().completeCurrentStop()
    expect(useTourStore.getState().completedStops).toContain('gateway-of-india')
  })

  it('should detect tour completion', () => {
    useTourStore.getState().setStops(COLABA_STOPS)
    COLABA_STOPS.forEach((_, i) => {
      useTourStore.setState({ currentStopIndex: i })
      useTourStore.getState().completeCurrentStop()
    })
    expect(useTourStore.getState().isComplete()).toBe(true)
  })

  it('should reset tour', () => {
    useTourStore.getState().setStops(COLABA_STOPS)
    useTourStore.getState().completeCurrentStop()
    useTourStore.getState().nextStop()
    useTourStore.getState().resetTour()
    const state = useTourStore.getState()
    expect(state.stops).toEqual([])
    expect(state.currentStopIndex).toBe(0)
    expect(state.completedStops).toEqual([])
  })
})
