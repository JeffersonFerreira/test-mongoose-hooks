import {GameSaveModel, UserModel} from "./Models";
import mongoose from "mongoose";

export async function removeUser(id) {
    await UserModel.deleteOne({
        _id: id
    });

    await GameSaveModel.deleteMany({
        userId: id
    })
}