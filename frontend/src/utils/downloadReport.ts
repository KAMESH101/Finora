import { toast } from "sonner@2.0.3";

export const downloadReport = (format: 'pdf' | 'word' | 'excel' | 'csv', reportName: string = 'Financial Report') => {
  toast.success(`📊 Generating ${format.toUpperCase()} report...`);
  
  // Simulate download delay
  setTimeout(() => {
    // In a real application, this would generate and download the actual file
    // For now, we'll create a mock download
    const blob = new Blob([`Mock ${reportName} - ${format.toUpperCase()}`], { 
      type: getMimeType(format) 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${getExtension(format)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`✅ ${reportName} downloaded as ${format.toUpperCase()}!`);
  }, 1500);
};

const getMimeType = (format: string): string => {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
  };
  return mimeTypes[format] || 'application/octet-stream';
};

const getExtension = (format: string): string => {
  const extensions: Record<string, string> = {
    pdf: 'pdf',
    word: 'docx',
    excel: 'xlsx',
    csv: 'csv',
  };
  return extensions[format] || 'txt';
};
