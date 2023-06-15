import * as mongoose from "mongoose";

export interface User {
    _id: mongoose.Types.ObjectId,
    name: string,
    bio: string
}

export interface GameSave {
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    data: string
}

const userSchema = new mongoose.Schema<User>({
    name: String,
    bio: String
});

// The hook must be in "pre" stage as we need to fetch the document before it gets deleted
userSchema.pre("deleteOne", {document: true, query: false}, async function () {
    const r = await GameSaveModel.deleteMany({
        userId: this._id
    })

    console.debug(r)
})

userSchema.pre("deleteOne", {document: false, query: true}, async function () {

    const doc = await this.model
        .findOne(this.getFilter(), {_id: 1})
        .lean() as Pick<User, "_id">

    await GameSaveModel.deleteMany({
        userId: doc._id
    })
})

userSchema.pre("deleteMany", {document: false, query: true}, async function () {
    const users = await this.model
        .find(this.getFilter(), {_id: 1})
        .lean() as Pick<User, "_id">[]

    await GameSaveModel.deleteMany({
        userId: {
            $in: users.map(u => u._id)
        }
    });
})

const gameSaveModel = new mongoose.Schema<GameSave>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    data: String
})

export const UserModel = mongoose.model<User>("user", userSchema);
export const GameSaveModel = mongoose.model<GameSave>("game_save", gameSaveModel)


