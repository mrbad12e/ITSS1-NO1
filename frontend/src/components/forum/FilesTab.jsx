// src/components/forum/FilesTab.jsx
import React, { useState, useEffect } from 'react';
import { FileIcon, Download, Search, File, Image, FileText, Grid2X2, List } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import forumActions from '@/actions/forumActions';

const FilesTab = ({ forumId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'documents'

    useEffect(() => {
        fetchFiles();
    }, [forumId]);

    const fetchFiles = async () => {
        try {
            const response = await forumActions.getForumResources(forumId);
            console.log(response);
            
            setFiles(response);
        } catch (err) {
            setError('Failed to fetch files');
        } finally {
            setLoading(false);
        }
    };

    const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
        const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];
        
        if (imageExtensions.includes(extension)) return 'image';
        if (documentExtensions.includes(extension)) return 'document';
        return 'other';
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image':
                return <Image className="h-6 w-6" />;
            case 'document':
                return <FileText className="h-6 w-6" />;
            default:
                return <File className="h-6 w-6" />;
        }
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase());
        const fileType = getFileType(file.title);
        
        if (filterType === 'all') return matchesSearch;
        if (filterType === 'images') return matchesSearch && fileType === 'image';
        if (filterType === 'documents') return matchesSearch && fileType === 'document';
        return matchesSearch;
    });

    const GridView = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file, index) => (
                <Card key={index} className="hover:bg-secondary/50">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer" 
                       className="p-4 flex flex-col items-center text-center">
                        {getFileIcon(getFileType(file.title))}
                        <h3 className="mt-2 font-medium text-sm truncate w-full">{file.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            by {file.uploadedBy}
                        </p>
                    </a>
                </Card>
            ))}
        </div>
    );

    const ListView = () => (
        <div className="space-y-2">
            {filteredFiles.map((file, index) => (
                <Card key={index} className="hover:bg-secondary/50">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer" 
                       className="p-4 flex items-center gap-4">
                        {getFileIcon(getFileType(file.title))}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{file.title}</h3>
                            <p className="text-xs text-muted-foreground">
                                Uploaded by {file.uploadedBy} • {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                From post: {file.postTitle}
                            </p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                </Card>
            ))}
        </div>
    );

    if (loading) {
        return <div className="flex h-64 items-center justify-center">Loading files...</div>;
    }

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search files..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary"
                    />
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-secondary"
                    >
                        <option value="all">All Files</option>
                        <option value="images">Images</option>
                        <option value="documents">Documents</option>
                    </select>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                        <Grid2X2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                        <List className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {filteredFiles.length === 0 && (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <FileIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">No files found</p>
                        <p className="text-sm text-muted-foreground">
                            {searchTerm ? 'Try different search terms' : 'Upload files in posts to see them here'}
                        </p>
                    </div>
                </div>
            )}

            {viewMode === 'grid' ? <GridView /> : <ListView />}
        </div>
    );
};

export default FilesTab;