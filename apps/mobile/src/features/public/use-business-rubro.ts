import { useEffect, useState } from 'react';
import { fetchBusinessRubroContext } from '../business/business-directory-api';
import {
  BusinessCategory,
  findDirectoryBusinessByCode,
  getBusinessCategoryLabel,
  getSelectStaffTitle,
  getStaffRoleLabel,
} from '../customer/business-directory';

export interface ActiveBusinessRubro {
  category: BusinessCategory;
  categoryLabel: string;
  staffLabel: string;
  selectStaffTitle: string;
  requiresSpecificStaff: boolean;
}

export function useBusinessRubro(shopCode?: string | null): ActiveBusinessRubro {
  const localMatch = findDirectoryBusinessByCode(shopCode);

  const [state, setState] = useState<ActiveBusinessRubro>(() => ({
    category: localMatch?.category ?? 'general',
    categoryLabel: localMatch?.categoryLabel ?? getBusinessCategoryLabel('general'),
    staffLabel: localMatch?.staffLabel ?? getStaffRoleLabel('general'),
    selectStaffTitle: getSelectStaffTitle(localMatch?.category, localMatch?.staffLabel),
    requiresSpecificStaff: localMatch?.requiresSpecificStaff ?? true,
  }));

  useEffect(() => {
    const code = (shopCode ?? '').trim();
    if (!code) return;

    const demo = findDirectoryBusinessByCode(code);
    if (demo) {
      setState({
        category: demo.category,
        categoryLabel: demo.categoryLabel,
        staffLabel: demo.staffLabel,
        selectStaffTitle: getSelectStaffTitle(demo.category, demo.staffLabel),
        requiresSpecificStaff: demo.requiresSpecificStaff,
      });
      return;
    }

    let active = true;
    fetchBusinessRubroContext(code).then((ctx) => {
      if (!active || !ctx) return;
      setState({
        category: ctx.category,
        categoryLabel: getBusinessCategoryLabel(ctx.category),
        staffLabel: ctx.staffLabel,
        selectStaffTitle: getSelectStaffTitle(ctx.category, ctx.staffLabel),
        requiresSpecificStaff:
          ctx.category !== 'atencion_cliente' && ctx.category !== 'retail',
      });
    });

    return () => {
      active = false;
    };
  }, [shopCode]);

  return state;
}