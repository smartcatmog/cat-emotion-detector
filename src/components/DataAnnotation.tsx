import React, { useState } from 'react';

interface AnnotatedImage {
  id: string;
  fileName: string;
  emotion: string;
  confidence: number;
  notes: string;
  timestamp: string;
}

const EMOTIONS = [
  { value: 'happy', label: '😸 Happy (开心)', description: '眼睛睁大，嘴角上扬' },
  { value: 'content', label: '😻 Content (满足)', description: '放松，舒服，眯眼' },
  { value: 'playful', label: '😼 Playful (好玩)', description: '追逐，跳跃，活跃' },
  { value: 'curious', label: '👀 Curious (好奇)', description: '耳朵竖起，眼睛睁大' },
  { value: 'anxious', label: '😿 Anxious (焦虑)', description: '躲藏，紧张，害怕' },
  { value: 'stressed', label: '😾 Stressed (压力)', description: '身体紧张，准备逃跑' },
  { value: 'angry', label: '😠 Angry (生气)', description: '耳朵后，眯眼，嘶鸣' },
  { value: 'sleepy', label: '😽 Sleepy (困倦)', description: '打哈欠，闭眼，懒散' },
  { value: 'hungry', label: '🍽️ Hungry (饿)', description: '叫声，走来走去，期待' },
  { value: 'neutral', label: '😺 Neutral (中立)', description: '正常状态，放松' },
];

export function DataAnnotation() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(50);
  const [notes, setNotes] = useState<string>('');
  const [annotatedImages, setAnnotatedImages] = useState<AnnotatedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAnnotation = async () => {
    if (!selectedFile || !selectedEmotion) {
      alert('Please select a file and emotion');
      return;
    }

    setIsLoading(true);

    try {
      const newAnnotation: AnnotatedImage = {
        id: Math.random().toString(36).substring(2, 11),
        fileName: selectedFile.name,
        emotion: selectedEmotion,
        confidence,
        notes,
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage for now
      const existing = JSON.parse(localStorage.getItem('annotatedImages') || '[]');
      const updated = [...existing, newAnnotation];
      localStorage.setItem('annotatedImages', JSON.stringify(updated));

      setAnnotatedImages(updated);

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setSelectedEmotion('');
      setConfidence(50);
      setNotes('');

      alert('✅ Image annotated and saved!');
    } catch (error) {
      alert('Error saving annotation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const data = JSON.parse(localStorage.getItem('annotatedImages') || '[]');
    const csv = [
      ['ID', 'FileName', 'Emotion', 'Confidence', 'Notes', 'Timestamp'],
      ...data.map((img: AnnotatedImage) => [
        img.id,
        img.fileName,
        img.emotion,
        img.confidence,
        img.notes,
        img.timestamp,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cat-annotations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all annotations? This cannot be undone.')) {
      localStorage.removeItem('annotatedImages');
      setAnnotatedImages([]);
    }
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    const data = JSON.parse(localStorage.getItem('annotatedImages') || '[]');
    setAnnotatedImages(data);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          📸 Cat Emotion Data Annotation
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Help train our model by labeling your cat's emotions
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            1. Upload Image
          </h3>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-lg max-h-64 object-cover"
              />
            ) : (
              <div className="space-y-2">
                <p className="text-4xl">📷</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
            >
              Choose Image
            </label>
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>File: {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {/* Annotation Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            2. Annotate Emotion
          </h3>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Emotion:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setSelectedEmotion(emotion.value)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedEmotion === emotion.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{emotion.label}</div>
                  <div className="text-xs opacity-75">{emotion.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confidence: {confidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Cat was playing with toy, ears back, etc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
              rows={3}
            />
          </div>

          <button
            onClick={handleSaveAnnotation}
            disabled={isLoading || !selectedFile || !selectedEmotion}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : '✅ Save Annotation'}
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          📊 Annotation Statistics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">{annotatedImages.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
          </div>
          {EMOTIONS.map((emotion) => {
            const count = annotatedImages.filter((img) => img.emotion === emotion.value).length;
            return (
              <div key={emotion.value} className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{count}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{emotion.label.split(' ')[0]}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportData}
            disabled={annotatedImages.length === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📥 Export as CSV
          </button>
          <button
            onClick={handleClearAll}
            disabled={annotatedImages.length === 0}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Recent Annotations */}
      {annotatedImages.length > 0 && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            📝 Recent Annotations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300 dark:border-gray-600">
                <tr>
                  <th className="text-left py-2 px-2">File</th>
                  <th className="text-left py-2 px-2">Emotion</th>
                  <th className="text-left py-2 px-2">Confidence</th>
                  <th className="text-left py-2 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {annotatedImages.slice(-10).reverse().map((img) => (
                  <tr key={img.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-2 truncate">{img.fileName}</td>
                    <td className="py-2 px-2">
                      {EMOTIONS.find((e) => e.value === img.emotion)?.label}
                    </td>
                    <td className="py-2 px-2">{img.confidence}%</td>
                    <td className="py-2 px-2">
                      {new Date(img.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
