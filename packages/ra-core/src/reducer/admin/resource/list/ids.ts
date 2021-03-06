import { Reducer } from 'redux';
import uniq from 'lodash/uniq';
import {
    CRUD_GET_LIST_SUCCESS,
    CrudGetListSuccessAction,
    CrudGetOneSuccessAction,
    CRUD_CREATE_SUCCESS,
    CrudCreateSuccessAction,
} from '../../../../actions';
import { DELETE, DELETE_MANY } from '../../../../core';
import { Identifier } from '../../../../types';

type IdentifierArray = Identifier[];

type ActionTypes =
    | CrudGetListSuccessAction
    | CrudGetOneSuccessAction
    | CrudCreateSuccessAction
    | {
          type: 'OTHER_ACTION';
          payload: any;
          meta: any;
      };

/**
 * List of the ids of the latest loaded page, regardless of params
 *
 * When loading a the list for the first time, useListController grabs the ids
 * from the cachedRequests reducer (not this ids reducer). It's only when the user
 * changes page, sort, or filter, that the useListController hook uses the ids
 * reducer, so as to show the previous list of results while loading the new
 * list (intead of displaying a blank page each time the list params change).
 *
 * @see useListController
 *
 */
const idsReducer: Reducer<IdentifierArray> = (
    previousState = [],
    action: ActionTypes
) => {
    if (action.meta && action.meta.optimistic) {
        if (action.meta.fetch === DELETE) {
            const index = previousState
                .map(el => el === action.payload.id) // eslint-disable-line eqeqeq
                .indexOf(true);
            if (index === -1) {
                return previousState;
            }
            return [
                ...previousState.slice(0, index),
                ...previousState.slice(index + 1),
            ];
        }
        if (action.meta.fetch === DELETE_MANY) {
            const newState = previousState.filter(
                el => !action.payload.ids.includes(el)
            );

            return newState;
        }
    }

    switch (action.type) {
        // modif JB
        case CRUD_DELETE_SUCCESS: {
            return previousState.filter((id) => (action as CrudDeleteSuccessAction).requestPayload.id !== id)
        }
        // end modif JB
        case CRUD_GET_LIST_SUCCESS:
            return action.payload.data.map(({ id }) => id);
        case CRUD_CREATE_SUCCESS:
            return uniq([action.payload.data.id, ...previousState]);
        default:
            return previousState;
    }
};

export default idsReducer;

export const getIds = state => state;
