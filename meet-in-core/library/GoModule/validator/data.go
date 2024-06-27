package validator

import (
	"encoding/json"
	"golang.org/x/net/context"
)

type Data struct {
	Data     map[string]*Cell
	HasError bool
	// SortKeys []string
}

func NewData(ctx context.Context, ds interface{}, keyCountor map[string]int) *Data {
	data := make(map[string]*Cell, len(ds.(map[string]interface{})))
	for k, v := range ds.(map[string]interface{}) {
		if i, ok := keyCountor[k]; ok {
			data[k] = NewCell(ctx, v.(string), i)
		} else {
			data[k] = NewCell(ctx, v.(string), 0)
		}
	}
	return &Data{data, false}
}

func (d *Data) report(ctx context.Context, keys []string, msg string) {
	d.HasError = true
	for _, k := range keys {
		c := d.Data[k]
		c.report(msg)
	}
}

func (d Data) JsonBytes(sortKeys []string) []byte {
	bs := make([]byte, 0, 100000)
	first := true
	for _, k := range sortKeys {
		if c := d.Data[k]; c != nil {
			if first {
				first = false
				bs = append(bs, []byte(`[`)...)
			} else {
				bs = append(bs, []byte(`,`)...)
			}
			bs = append(bs, []byte(`{"name_key":`)...)
			name, _ := json.Marshal(k)
			bs = append(bs, name...)
			bs = append(bs, []byte(`,"data":`)...)
			data, _ := json.Marshal(c.String())
			bs = append(bs, data...)
			bs = append(bs, []byte(`,"errMsg":`)...)
			reports, _ := json.Marshal(c.Reports)
			bs = append(bs, reports...)
			bs = append(bs, []byte(`}`)...)
		}
	}
	bs = append(bs, []byte(`]`)...)
	return bs
}
