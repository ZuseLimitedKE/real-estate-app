'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    paramName: string
}

export default function PaginationControls({ currentPage, totalPages, paramName }: PaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updatePage = (newPage: number) => {
        const clamped = Math.max(1, Math.min(newPage, totalPages))
        if (clamped === currentPage) return
        const params = new URLSearchParams(searchParams.toString())
        params.set(paramName, clamped.toString())
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-row gap-2 items-center">
            <Button
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="w-2 h-4" />
            </Button>

            <div className="p-2">
                {currentPage}
            </div>

            <Button
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="w-2 h-4" />
            </Button>
        </div>
    )
}