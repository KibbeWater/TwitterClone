import mongoose, { Model, Schema, Types } from 'mongoose';
import User from './IUser';

export interface IRelationship {
	_id: Types.ObjectId;
	author?: Types.ObjectId;
	target?: Types.ObjectId;
	type: 'follow' | 'block' | 'mute';
}

interface RelationshipModel extends Model<IRelationship> {
	createRelationship: (
		author: Types.ObjectId,
		target: Types.ObjectId,
		type: 'follow' | 'block' | 'mute'
	) => Promise<IRelationship | null>;
	removeRelationship: (author: Types.ObjectId, target: Types.ObjectId) => Promise<IRelationship | null>;
}

export const relationshipSchema = new Schema<IRelationship, RelationshipModel>(
	{
		author: { type: Types.ObjectId, ref: 'User' },
		target: { type: Types.ObjectId, ref: 'User' },
		type: { type: String, enum: ['follow', 'block', 'mute'] },
	},
	{
		statics: {
			createRelationship: function (author: Types.ObjectId, target: Types.ObjectId, type: 'follow' | 'block' | 'mute') {
				return new Promise((resolve, reject) => {
					this.create({
						author,
						target,
						type,
					}).then((relationship) => {
						User.findById(author).then((user) => {
							user?.relationships.push(relationship._id);
							user?.save();
							resolve(relationship);
						});
					});
				});
			},

			removeRelationship: function (author: Types.ObjectId, target: Types.ObjectId) {
				return new Promise((resolve, reject) => {
					this.findOneAndDelete({ author, target }).then((relationship) => {
						User.findById(author).then(async (user) => {
							if (user) {
								user.relationships = user.relationships.filter(
									(rel) => rel.toString() !== relationship?._id.toString()
								) as [Types.ObjectId];
								await user.save();
							}
							resolve(relationship);
						});
					});
				});
			},
		},
	}
);

// Fix recompilation error
const Relationship =
	(mongoose.models.Relationship as RelationshipModel) ||
	mongoose.model<IRelationship, RelationshipModel>('Relationship', relationshipSchema);

export default Relationship;
