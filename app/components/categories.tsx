import type { DragEventHandler } from 'react';
import { memo, useState } from 'react';

import { Category } from '~/components/category';
import isEqual from 'fast-deep-equal';
import type { UINote } from './note';

interface IProps {
	categories: {
		id: string;
		title: string;
		isOpen: boolean;
		order: number | null;
		createdAt: string;
		notes: UINote[];
	}[];
	refetch: () => void;
}

export const Categories = memo(
	function Categories({ categories, refetch }: IProps) {
		const sortedCategories =
			categories.sort((a, b) => {
				if (typeof a.order === 'number') {
					if (typeof b.order === 'number') {
						return a.order - b.order;
					}
					return 1;
				}

				if (typeof b.order === 'number') {
					return -1;
				}

				return a.createdAt.localeCompare(b.createdAt);
			}) || [];

		return (
			<>
				{sortedCategories.map((category, i) => (
					<div key={category.id}>
						<DropZone
							categoryId={category.id}
							allCategories={sortedCategories}
							position="above"
							refetch={refetch}
						/>
						<Category category={category} refetch={refetch} />
						{i === sortedCategories.length - 1 && (
							<DropZone
								categoryId={category.id}
								allCategories={sortedCategories}
								position="above"
								refetch={refetch}
							/>
						)}
					</div>
				))}
			</>
		);
	},
	(prevProps, newProps) => isEqual(newProps.categories, prevProps.categories),
);

interface IDropZoneProps {
	categoryId: string;
	allCategories: IProps['categories'];
	position: 'above' | 'below';
	refetch: () => void;
}

function DropZone({
	categoryId,
	allCategories,
	position,
	refetch,
}: IDropZoneProps) {
	const [isDraggedOver, setIsDraggedOver] = useState(false);

	const handleDragOver: DragEventHandler<HTMLDivElement> = e => {
		if (e.dataTransfer.types.includes('category')) {
			setIsDraggedOver(true);
		}
		e.preventDefault();
	};

	const handleDrop: DragEventHandler<HTMLDivElement> = e => {
		setIsDraggedOver(false);

		const droppedId = e.dataTransfer.getData('category');
		if (!droppedId) return;

		if (droppedId === categoryId) return;

		const droppedCategory = allCategories.find(
			({ id }) => id === droppedId,
		);
		const existingWithoutDropped = allCategories.filter(
			({ id }) => id !== droppedId,
		);
		if (!droppedCategory) return;

		const newOrderings: Array<{
			id: string;
			order: number;
		}> = [];
		let currOrder = 0;
		for (const category of existingWithoutDropped) {
			if (category.id === categoryId && position === 'above') {
				newOrderings.push({
					id: droppedCategory.id,
					order: currOrder++,
				});
			}
			newOrderings.push({ id: category.id, order: currOrder++ });
			if (category.id === categoryId && position === 'below') {
				newOrderings.push();
			}
		}

		fetch('/api/edit/category-orders', {
			method: 'post',
			body: JSON.stringify({ categories: newOrderings }),
		}).then(refetch);
	};

	return (
		<div
			className={`h-[30px] my-1 rounded ${
				isDraggedOver ? 'bg-gray-100' : ''
			}`}
			onDragEnter={handleDragOver}
			onDragOver={handleDragOver}
			onDragLeave={() => setIsDraggedOver(false)}
			onDrop={handleDrop}
		/>
	);
}
