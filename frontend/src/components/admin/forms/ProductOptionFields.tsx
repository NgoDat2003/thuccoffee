import {
  useAdminProductOptions,
} from '../../../services/admin/product-options.service';

export interface OptionLinkDraft {
  optionId: number;
  price: string;
  label: string;
  ticked: boolean;
}

interface ProductOptionFieldsProps {
  optionLinks: OptionLinkDraft[];
  onOptionLinksChange: (links: OptionLinkDraft[]) => void;
  priceErrors?: Record<number, string>;
}

// Section Options của form sản phẩm: gắn lựa chọn phục vụ có giá riêng.
// Bỏ tick không xóa giá/nhãn đã nhập — chỉ đánh dấu `ticked: false` để tick lại
// không mất dữ liệu, giống hành vi CMS gốc.
export default function ProductOptionFields({
  optionLinks,
  onOptionLinksChange,
  priceErrors = {},
}: ProductOptionFieldsProps) {
  const options = useAdminProductOptions();

  const toggleOption = (optionId: number) => {
    const existing = optionLinks.find((link) => link.optionId === optionId);
    onOptionLinksChange(existing
      ? optionLinks.map((link) =>
        link.optionId === optionId ? { ...link, ticked: !link.ticked } : link)
      : [...optionLinks, { optionId, price: '0', label: '', ticked: true }]);
  };

  const setOptionPrice = (optionId: number, price: string) => {
    onOptionLinksChange(optionLinks.map((link) =>
      link.optionId === optionId ? { ...link, price } : link,
    ));
  };

  const setOptionLabel = (optionId: number, label: string) => {
    onOptionLinksChange(optionLinks.map((link) =>
      link.optionId === optionId ? { ...link, label } : link,
    ));
  };

  return (
    <fieldset>
      <legend className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">
        Lựa chọn phục vụ (giá theo lựa chọn)
      </legend>
      {options.isPending ? (
        <p className="text-[13px] text-admin-muted">Đang tải options…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(options.data ?? []).map((option) => {
            const link = optionLinks.find((item) => item.optionId === option.id);
            const isTicked = link?.ticked ?? false;
            const error = priceErrors[option.id];

            return (
              <div
                key={option.id}
                className={`rounded-[10px] border p-3.5 transition-colors ${
                  isTicked
                    ? 'border-admin-accent bg-admin-accent/5'
                    : 'border-admin-border bg-admin-surface'
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[13.5px] font-semibold text-admin-ink">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggleOption(option.id)}
                    />
                    {option.name}
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-admin-muted">
                      Giá (đ)
                    </label>
                    <input
                      type="number"
                      min="1"
                      disabled={!isTicked}
                      value={link?.price ?? '0'}
                      onChange={(event) => setOptionPrice(option.id, event.target.value)}
                      className={`mt-1 w-full text-[13.5px] ${
                        !isTicked ? 'bg-admin-bg cursor-not-allowed opacity-50' : ''
                      } ${error ? 'border-admin-danger/50 focus:border-admin-danger focus:ring-admin-danger/20' : ''}`}
                      placeholder="0"
                      aria-label={`Giá cho ${option.name}`}
                    />
                    {error && (
                      <p role="alert" className="mt-1 text-[11px] font-medium text-admin-danger">
                        {error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-admin-muted">
                      Nhãn hiển thị
                    </label>
                    <input
                      type="text"
                      disabled={!isTicked}
                      value={link?.label ?? ''}
                      onChange={(event) => setOptionLabel(option.id, event.target.value)}
                      className={`mt-1 w-full text-[13.5px] ${
                        !isTicked ? 'bg-admin-bg cursor-not-allowed opacity-50' : ''
                      }`}
                      placeholder={option.name}
                      maxLength={120}
                      aria-label={`Nhãn hiển thị cho ${option.name}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
