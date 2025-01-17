import { AmmDexOperation } from '@ergolabs/ergo-dex-sdk';
import { uniqBy } from 'lodash';

import { getFormattedDate } from '../../../utils/date';
import { getAssetNameByMappedId } from '../../../utils/map';
import { renderFractions } from '../../../utils/math';
import { Operation } from './types';

export const normalizeOperations = (ops: AmmDexOperation[]): Operation[] => {
  return uniqBy(
    ops.reduce((acc, op) => {
      if (op.type === 'order') {
        if (op.order.type === 'swap') {
          return [
            ...acc,
            {
              assetX: {
                name:
                  op.order.from.asset.name ||
                  getAssetNameByMappedId(op.order.to.id) ||
                  'unknown',
              },
              //TODO:[SDK]ADD_ASSET_Y_AS_ASSET_AMOUNT[]
              assetY: {
                name:
                  op.order.to.name ||
                  getAssetNameByMappedId(op.order.to.id) ||
                  'unknown',
              },
              type: op.order.type,
              status: op.status,
              txId: op.txId,
              timestamp: getFormattedDate(op.timestamp),
            },
          ];
        }
        if (op.order.type === 'deposit') {
          return [
            ...acc,
            {
              assetX: {
                name: op.order.inX.asset.name || 'unknown',
                amount: Number(
                  renderFractions(
                    op.order.inX.amount,
                    op.order.inX.asset.decimals,
                  ),
                ),
              },
              assetY: {
                name: op.order.inY.asset.name || 'unknown',
                amount: Number(
                  renderFractions(
                    op.order.inY.amount,
                    op.order.inY.asset.decimals,
                  ),
                ),
              },
              type: op.order.type,
              status: op.status,
              txId: op.txId,
              timestamp: getFormattedDate(op.timestamp),
            },
          ];
        }
        if (op.order.type === 'redeem') {
          // TODO:[SDK]ADD_REDEEM_PAIR[EDEX-478]
          return acc;
        }
      }

      return acc;
    }, [] as any),
    (op) => op.txId,
  );
};
