import { useNavigate } from 'react-router-dom'
import FlipResults, { type ResultsStats } from '../home/FlipResults'
import { LEARNED, NEW, REVIEW, TOTAL } from '../home/resultWordsData'
import './results.css'

/** A finished three-round session used to preview the summary. */
const ROUNDS = [
  { e: 8, r: 9 },
  { e: 8, r: 8 },
  { e: 6, r: 5 },
]

const STATS: ResultsStats = {
  studied: LEARNED.length,
  newWords: NEW.length,
  reviewWords: REVIEW.length,
  exposed: ROUNDS.reduce((sum, d) => sum + d.e, 0),
  reveals: TOTAL,
  words: LEARNED.map((d) => ({ word: d.w, count: d.n, kind: d.kind })),
  rounds: ROUNDS,
  deck: 8,
}

/** Result page: the round summary on its own, no deck to play first. */
export default function Results() {
  const navigate = useNavigate()
  return (
    <div className="results-page">
      <FlipResults
        stats={STATS}
        onContinue={() => navigate('/flip')}
        onStop={() => navigate('/')}
        contained
      />
    </div>
  )
}
