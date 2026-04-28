export interface GetTimesResult {
  dawn: Date
  dusk: Date
  goldenHour: Date
  goldenHourEnd: Date
  nadir: Date
  nauticalDawn: Date
  nauticalDusk: Date
  night: Date
  nightEnd: Date
  solarNoon: Date
  sunrise: Date
  sunriseEnd: Date
  sunset: Date
  sunsetStart: Date
}
export interface GetSunPositionResult {
  altitude: number
  azimuth: number
}
export interface GetMoonPositionResult {
  altitude: number
  azimuth: number
  distance: number
  parallacticAngle: number
}
export interface GetMoonIlluminationResult {
  fraction: number
  phase: number
  angle: number
}
export interface GetMoonTimes {
  rise: Date
  set: Date
  alwaysUp?: true
  alwaysDown?: true
}

declare const SunCalc: {
  getTimes(date: Date, latitude: number, longitude: number, height?: number): GetTimesResult
  addTime(angleInDegrees: number, morningName: string, eveningName: string): void
  getPosition(timeAndDate: Date, latitude: number, longitude: number): GetSunPositionResult
  getMoonPosition(timeAndDate: Date, latitude: number, longitude: number): GetMoonPositionResult
  getMoonIllumination(timeAndDate: Date): GetMoonIlluminationResult
  getMoonTimes(date: Date, latitude: number, longitude: number, inUTC?: boolean): GetMoonTimes
}
