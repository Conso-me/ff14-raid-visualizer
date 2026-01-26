import React, { useState, useCallback, useRef } from 'react';

interface DraggableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, isDragging: boolean, isDropTarget: boolean) => React.ReactNode;
  getItemId?: (item: T) => string;
}

export function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  getItemId = (item) => item.id,
}: DraggableListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const draggedIndexRef = useRef<number>(-1);

  const handleDragStart = useCallback((e: React.DragEvent, index: number, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
    draggedIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) {
      setDropTargetId(id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = draggedIndexRef.current;

    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    // Create new array with reordered items
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    onReorder(newItems);
    setDraggedId(null);
    setDropTargetId(null);
    draggedIndexRef.current = -1;
  }, [items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
    draggedIndexRef.current = -1;
  }, []);

  return (
    <div>
      {items.map((item, index) => {
        const id = getItemId(item);
        const isDragging = draggedId === id;
        const isDropTarget = dropTargetId === id;

        return (
          <div
            key={id}
            draggable
            onDragStart={(e) => handleDragStart(e, index, id)}
            onDragOver={(e) => handleDragOver(e, index, id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              cursor: 'grab',
              opacity: isDragging ? 0.5 : 1,
              transition: 'background-color 0.1s, transform 0.1s',
              ...(isDropTarget ? {
                transform: 'translateY(4px)',
              } : {}),
            }}
          >
            {isDropTarget && (
              <div
                style={{
                  height: '2px',
                  background: '#3753c7',
                  marginBottom: '2px',
                }}
              />
            )}
            {renderItem(item, isDragging, isDropTarget)}
          </div>
        );
      })}
    </div>
  );
}
