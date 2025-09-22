"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export default function PaginationControls(props: { page: number, updatePage: (page: number) => void, isThereMore: boolean }) {
    const incrementPageNumber = () => {
        if (props.isThereMore === true) {
            props.updatePage(props.page + 1);
        }
    }

    const decrementPageNumber = () => {
        if (props.page > 1) {
            props.updatePage(props.page - 1);
        }
    }

    return (
        <div className="flex flex-row gap-2 items-center">
            <Button
                onClick={decrementPageNumber}
                disabled={props.page <= 1}
            ><ChevronLeft className="w-2 h-4" /></Button>
            <div className="p-2">
                {props.page}
            </div>
            <Button
                disabled={!props.isThereMore}
                onClick={incrementPageNumber}
            ><ChevronRight className="w-2 h-4" /></Button>
        </div>
    );
}