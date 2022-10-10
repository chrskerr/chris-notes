import { Note } from './note';
import { memo } from 'react';

interface Props {
	data: Array<{
		label: string;
		notes: {
			id: string;
			content: string;
			completedAt: Date | string | null;
		}[];
	}>;
	refetch: () => void;
}

export const Done = memo(function Done({ data, refetch }: Props) {
	if (data.length === 0) {
		return null;
	}

	return (
		<details className="p-1 pl-4 mb-4 border border-dashed rounded">
			<summary className="flex items-center">
				<span className="flex-1 px-4 py-2 text-xl outline-none">
					Done
				</span>
			</summary>
			<div className="pl-[17px] pt-2">
				{data.map(noteGroup => (
					<details key={noteGroup.label} className="mb-3">
						<summary className="pb-1">{noteGroup.label}</summary>
						{noteGroup.notes.map(note => (
							<Note
								key={note.id}
								note={{
									...note,
									completedAt: note.completedAt
										? new Date(note.completedAt)
										: null,
								}}
								refetch={refetch}
							/>
						))}
					</details>
				))}
			</div>
		</details>
	);
});
