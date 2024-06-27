package validator

import (
	"golang.org/x/net/context"
)

type Schema struct {
	MaxErrCount int
	Funcs       []CellChecker
}

func NewSchema(r interface{}) *Schema {
	var (
		sc Schema
	)

	if _, ok := r.(map[string]interface{})["validations"]; ok {
		if _, ok := r.(map[string]interface{})["length"]; ok {
			// validationRule.schema.lengthがある場合
			if cChecker := NewCellChecker("length", int(r.(map[string]interface{})["length"].(float64))); cChecker != nil {
				sc.Funcs = make([]CellChecker, 0, len(r.(map[string]interface{})["validations"].([]interface{}))+1)
				sc.Funcs = append(sc.Funcs, cChecker)
			} else {
				sc.Funcs = make([]CellChecker, 0, len(r.(map[string]interface{})["validations"].([]interface{})))
			}
		} else {
			// validationRule.schema.lengthがなかった場合
			sc.Funcs = make([]CellChecker, 0, len(r.(map[string]interface{})["validations"].([]interface{})))
		}
	} else {
		if _, ok := r.(map[string]interface{})["length"]; ok {
			// validationRule.schema.lengthがある場合
			sc.Funcs = []CellChecker{
				NewCellChecker("length", int(r.(map[string]interface{})["length"].(float64))),
			}
		}
	}

	if _, ok := r.(map[string]interface{})["validations"].([]interface{}); ok {
		for i := 0; len(r.(map[string]interface{})["validations"].([]interface{})) > i; i++ {
			sc.Funcs = append(sc.Funcs, NewCellChecker(r.(map[string]interface{})["validations"].([]interface{})[i].(string)))
		}
	}

	if l := len(sc.Funcs); l > 0 {
		sc.MaxErrCount = l
	} else {
		return nil
	}
	return &sc
}

type CrossSchema struct {
	// Title string
	Typ           string
	Target        []string
	ErrorMsg      string
	ErrorPosision []string
	Check         func(context.Context, *Data) bool
}

func NewCrossSchema(r interface{}) *CrossSchema {
	// title := r.(map[string]interface{})["title"].(string)
	typ := r.(map[string]interface{})["type"].(string)
	target := make([]string, len(r.(map[string]interface{})["target"].([]interface{})))
	errMsg := r.(map[string]interface{})["error"].(map[string]interface{})["msg"].(string)
	errPos := make([]string, len(r.(map[string]interface{})["error"].(map[string]interface{})["pos"].([]interface{})))
	for i := 0; len(r.(map[string]interface{})["target"].([]interface{})) > i; i++ {
		target[i] = r.(map[string]interface{})["target"].([]interface{})[i].(string)
	}
	for i := 0; len(errPos) > i; i++ {
		errPos[i] = r.(map[string]interface{})["error"].(map[string]interface{})["pos"].([]interface{})[i].(string)
	}
	args := r.(map[string]interface{})["args"].([]interface{})

	if checker := NewCrossChecker(typ, target, errPos, errMsg, args...); checker != nil {
		return &CrossSchema{
			// title,
			typ,
			target,
			errMsg,
			errPos,
			checker,
		}
	} else {
		return nil
	}
}
