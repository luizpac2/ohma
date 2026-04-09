import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RankingRow } from '@/types'

export function useRealtimeRanking() {
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchRanking = async () => {
    const { data, error: err } = await supabase
      .from('ranking')
      .select('*')

    if (err) {
      setError(err.message)
    } else {
      setRanking((data as RankingRow[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRanking()

    // Inscreve no canal realtime para a tabela pontuacao
    const channel = supabase
      .channel('ranking-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pontuacao' },
        () => { fetchRanking() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'penalidades' },
        () => { fetchRanking() }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return { ranking, loading, error, refetch: fetchRanking }
}
