"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileFilters } from "./components/FileFilters";
import { FileTable } from "./components/FileTable";
import { UploadFileForm } from "./components/UploadFileForm";
import { useFiles } from "./hooks/useFiles";
import { Pagination } from "@/components/ui/table";

export default function FilesPage() {
    const {
        files,
        loading,
        error,
        pagination,
        sortBy,
        sortDir,
        onSort,
        page,
        setPage,
        limit,
        search,
        setSearch,
        type,
        setType,
        createFile,
        removeFile,
    } = useFiles();
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">File Repository</h1>
                    <p className="mt-1 text-sm text-text-body">
                        SOPs, reports, receipts, posters — institutional documents in one place.
                    </p>
                </div>
                <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Add File
                </Button>
            </div>

            <FileFilters
                search={search}
                setSearch={setSearch}
                type={type}
                setType={setType}
                total={pagination.totalCount}
            />

            {error && <p className="text-sm text-error">{error}</p>}

            {loading && files.length === 0 ? (
                <p className="text-sm text-text-body">Loading files…</p>
            ) : (
                <FileTable
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={onSort}
                    files={files}
                    onDelete={(id) => void removeFile(id)}
                />
            )}

            <UploadFileForm open={open} onClose={() => setOpen(false)} onSubmit={createFile} />

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                limit={limit}
                onPage={setPage}
                noun="files"
            />
        </div>
    );
}
