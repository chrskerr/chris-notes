import type { UINote } from './note';
import { Note } from './note';
import debounce from 'lodash/debounce';
import type {
	DragEventHandler,
	KeyboardEventHandler,
	MouseEventHandler,
} from 'react';
import { memo } from 'react';
import { useEffect, useState } from 'react';
import isEqual from 'fast-deep-equal';

interface Props {
	category: {
		id: string;
		title: string;
		isOpen: boolean;
		notes: UINote[];
	};
	refetch: () => void;
}

function handleSave(id: string, newTitle: string) {
	return fetch('/api/edit/category', {
		method: 'post',
		body: JSON.stringify({ id, title: newTitle }),
	});
}

const debouncedHandleSave = debounce(handleSave, 5_000);

const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

const handleKeyUp: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (e.key === ' ') {
		e.preventDefault();
	}
};

export const Category = memo(
	function Category({ category, refetch }: Props) {
		const { id, title, notes } = category;

		const [titleContent, setTitleContent] = useState(title);
		const [isDraggedOver, setIsDraggedOver] = useState(false);

		useEffect(() => {
			setTitleContent(title);
		}, [title]);

		useEffect(() => {
			if (titleContent !== title) {
				debouncedHandleSave(id, titleContent);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [titleContent]);

		function handleAdd() {
			fetch('/api/create/note', {
				method: 'post',
				body: JSON.stringify({ id: id }),
			}).then(refetch);
		}

		const handleDragOver: DragEventHandler<HTMLDetailsElement> = e => {
			e.preventDefault();
			setIsDraggedOver(true);
		};

		const handleDrop: DragEventHandler<HTMLDetailsElement> = e => {
			setIsDraggedOver(false);
			const noteId = e.dataTransfer.getData('text/plain');
			fetch('/api/edit/note', {
				method: 'post',
				body: JSON.stringify({ id: noteId, categoryId: id }),
			}).then(refetch);
		};

		function handleDelete() {
			const shouldProceed = confirm(
				`Are you sure you want to delete "${titleContent}"?`,
			);
			if (shouldProceed) {
				fetch('/api/delete/category', {
					method: 'post',
					body: JSON.stringify({ id }),
				}).then(refetch);
			}
		}

		const handleToggle: MouseEventHandler<HTMLDetailsElement> = e => {
			fetch('/api/edit/category', {
				method: 'post',
				body: JSON.stringify({ id, isOpen: e.currentTarget.open }),
			});
		};

		return (
			<details
				className={`p-1 pl-4 mb-4 border border-dashed rounded transition-color ${
					isDraggedOver ? 'border-black' : ''
				}`}
				open={category.isOpen}
				onToggle={handleToggle}
				onDragEnter={handleDragOver}
				onDragOver={handleDragOver}
				onDragLeave={() => setIsDraggedOver(false)}
				onDrop={handleDrop}
			>
				<summary className="flex items-center">
					<div className="flex items-center flex-1 stransition-color rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100">
						<span
							className="flex-1 px-4 py-2 text-xl break-all outline-none"
							contentEditable
							suppressContentEditableWarning
							spellCheck
							onInput={e =>
								setTitleContent(e.currentTarget.innerText)
							}
							onKeyDown={handleKeyDown}
							onKeyUp={handleKeyUp}
							onClick={e => e.preventDefault()}
							onBlur={e =>
								handleSave(id, e.currentTarget.innerText).then(
									refetch,
								)
							}
						>
							{title}
						</span>
						<span
							onClick={handleDelete}
							className="mr-4 text-red-500 cursor-pointer"
						>
							x
						</span>
					</div>
				</summary>
				<div className="pl-[17px]">
					{notes.map(note => (
						<Note key={note.id} note={note} refetch={refetch} />
					))}
				</div>
				<div
					onClick={handleAdd}
					className="px-4 py-2 mt-2 transition-colors rounded cursor-pointer hover:bg-slate-100"
				>
					<span className="mr-2">+</span>
					<span>Add new note</span>
				</div>
			</details>
		);
	},
	(prevProps, newProps) => isEqual(newProps.category, prevProps.category),
);
