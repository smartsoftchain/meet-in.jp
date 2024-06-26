package validator

import (
	"testing"
)

func TestSchema(t *testing.T) {
	var sc *Schema
	sc = NewSchema(map[string]interface{}{
		"validations": []interface{}{"required", "color"},
		"length":      float64(10),
	})

	if sc == nil {
		t.Errorf("Schemaの生成ができませんでした。: %+v", *sc)
	}
	if sc.MaxErrCount != 3 {
		t.Errorf("全てのスキーマが生成されていません。: %+v", *sc)
	}

	sc = NewSchema(map[string]interface{}{
		"validations": []interface{}{"required", "color"},
	})
	if sc == nil {
		t.Error("lenghtを設定しないSchemaの生成ができませんでした。")
	}

	sc = NewSchema(map[string]interface{}{
		"length": float64(10),
	})
	if sc == nil {
		t.Error("validationsを設定しないSchemaの生成ができませんでした。")
	}
	sc = NewSchema(map[string]interface{}{})
	if sc != nil {
		t.Error("nil値が返ってきませんでした。")
	}

}
