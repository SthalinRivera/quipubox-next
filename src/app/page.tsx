'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {

    const router = useRouter()

    const data = null

    useEffect(() => {
        if (!data) {
            router.push('/dashboard')
        }
    }, [data])

    return <div>Contenido</div>
}