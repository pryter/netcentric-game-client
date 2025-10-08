type RoomState = "waiting" | "running" | "next-round-countdown" | "resolved" | ""
type PlayerData = {
  isReady: boolean,
  displayName: string,
  id: string,
  avatarUri: string,
  score: number,
}

/** RoomFrame is the frame that will be sent to the client
 * @property timer is the global timer of the room (in this case 1 minute and counting down).
 * the timer should count down from 60 and reset everytime user completes each question.
 * @property breakTimer is the timer for the break (before first round, next round...).
 * @property players is the record of players in the room by using their **id** as the key
 * @property round is the current round number
 * @property winner is the player who won the round
 * */
export type RoomFrame = {
  score: 0,
  question: "",
  tick: 0,
  timer: 0,
  state: "waiting"
}

// export const defaultFrame: RoomFrame = {players: {}, timer: 0, breakTimer: 0, round: 0, winner: null, state: "", question:""}