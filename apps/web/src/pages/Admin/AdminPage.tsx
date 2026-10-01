import {
  Alert,
  Button,
  SegmentedControl,
  Spinner,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import {
  localName,
  useAdminCatalog,
  type AdminLeafCategory,
  type AdminParentCategory,
  type CategoryKind,
} from '../../lib/admin';
import { CategoryEditor } from './components/CategoryEditor';
import { IngredientEditor } from './components/IngredientEditor';

type Tab = 'ingredients' | 'categories';
type Editing =
  | { type: 'ingredient'; id: string | null }
  | { type: 'category'; kind: CategoryKind; id: string | null }
  | null;

export function AdminPage() {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const catalog = useAdminCatalog();
  const [tab, setTab] = useState<Tab>('ingredients');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return (catalog.data?.ingredients ?? []).filter(
      (item) =>
        needle === '' ||
        localName(item, i18n.language).toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle),
    );
  }, [catalog.data, filter, i18n.language]);

  const data = catalog.data;
  let editor = null;
  if (data && editing?.type === 'ingredient') {
    const ingredient = data.ingredients.find((i) => i.id === editing.id);
    editor = (
      <IngredientEditor
        key={editing.id ?? 'new'}
        ingredient={ingredient}
        catalog={data}
        onDone={close}
      />
    );
  } else if (data && editing?.type === 'category') {
    const list: Array<AdminParentCategory | AdminLeafCategory> =
      editing.kind === 'parent' ? data.parentCategories : data.leafCategories;
    editor = (
      <CategoryEditor
        key={`${editing.kind}-${editing.id ?? 'new'}`}
        kind={editing.kind}
        category={list.find((c) => c.id === editing.id)}
        catalog={data}
        onDone={close}
      />
    );
  }

  return (
    <>
      <AppScreenHeader title={t('admin:title')} />
      <Stack spacing={3}>
        {catalog.error ? (
          <Alert>{translateApiError(t, catalog.error)}</Alert>
        ) : null}
        {catalog.isPending ? <Spinner label={t('common:loading')} /> : null}
        {data && editor ? editor : null}
        {data && !editor ? (
          <>
            <SegmentedControl
              label={t('admin:sections')}
              value={tab}
              onChange={setTab}
              options={[
                { value: 'ingredients', label: t('admin:tabs.ingredients') },
                { value: 'categories', label: t('admin:tabs.categories') },
              ]}
            />
            {tab === 'ingredients' ? (
              <Stack spacing={2}>
                <Button
                  onClick={() => setEditing({ type: 'ingredient', id: null })}
                >
                  {t('admin:ingredient.new')}
                </Button>
                <TextField
                  label={t('admin:ingredient.filter')}
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                />
                {filtered.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('admin:ingredient.empty')}
                  </Typography>
                ) : (
                  <Stack
                    component="ul"
                    spacing={1}
                    sx={{ m: 0, p: 0, listStyle: 'none' }}
                  >
                    {filtered.map((item) => (
                      <li key={item.id}>
                        <Button
                          variant="text"
                          aria-label={t('admin:ingredient.edit', {
                            name: localName(item, i18n.language),
                          })}
                          onClick={() =>
                            setEditing({ type: 'ingredient', id: item.id })
                          }
                        >
                          {localName(item, i18n.language)}
                        </Button>
                      </li>
                    ))}
                  </Stack>
                )}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={() =>
                      setEditing({ type: 'category', kind: 'parent', id: null })
                    }
                  >
                    {t('admin:category.newParent')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setEditing({ type: 'category', kind: 'leaf', id: null })
                    }
                  >
                    {t('admin:category.newLeaf')}
                  </Button>
                </Stack>
                {data.parentCategories.map((parent) => {
                  const leaves = data.leafCategories.filter(
                    (leaf) => leaf.parentId === parent.id,
                  );
                  return (
                    <Stack key={parent.id} component="section" spacing={0.5}>
                      <Button
                        variant="text"
                        aria-label={t('admin:category.editParent', {
                          name: localName(parent, i18n.language),
                        })}
                        onClick={() =>
                          setEditing({
                            type: 'category',
                            kind: 'parent',
                            id: parent.id,
                          })
                        }
                      >
                        {localName(parent, i18n.language)}
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin:category.leafCount', {
                          count: leaves.length,
                        })}
                      </Typography>
                      <Stack
                        component="ul"
                        sx={{ m: 0, pl: 2, listStyle: 'none' }}
                      >
                        {leaves.map((leaf) => (
                          <li key={leaf.id}>
                            <Button
                              variant="text"
                              aria-label={t('admin:category.editLeaf', {
                                name: localName(leaf, i18n.language),
                              })}
                              onClick={() =>
                                setEditing({
                                  type: 'category',
                                  kind: 'leaf',
                                  id: leaf.id,
                                })
                              }
                            >
                              {localName(leaf, i18n.language)}
                            </Button>
                          </li>
                        ))}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </>
        ) : null}
      </Stack>
    </>
  );
}
