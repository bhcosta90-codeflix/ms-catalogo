// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Component} from "@loopback/core";
import {UpdateCategoryRelationObserver} from "../observers";

export class EntityComponent implements Component {
    lifeCycleObservers = [
        UpdateCategoryRelationObserver
    ]
}