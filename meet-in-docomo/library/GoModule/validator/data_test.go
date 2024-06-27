package validator

import (
	"golang.org/x/net/context"
	"testing"
)

func TestNewData(t *testing.T) {
	var d *Data
	testData := map[string]interface{}{
		"data1": "テスト",
		"data2": "テスト",
	}
	sortKeys := []string{"data1", "data2"}
	keyCountor := map[string]int{}
	ctx := context.Background()
	ctx = context.WithValue(ctx, "sortKeys", sortKeys)

	d = NewData(ctx, testData, keyCountor)
	if d.HasError {
		t.Error("Dataの初期化時にHasErrorがtrueです。")
	}
}

func BenchmarkNewData(b *testing.B) {
	keyCountor := map[string]int{}
	// ctx := context.WithValue(context.Background(), "sortKeys", []string{
	//   "data1",
	//   "data2",
	//   "data3",
	//   "data4",
	//   "data5",
	//   "data6",
	//   "data7",
	// })
	ctx := context.TODO()
	for i := 0; b.N > i; i++ {
		_ = NewData(ctx, map[string]interface{}{
			"data1": "テスト",
			"data2": "テスト",
			"data3": "テスト",
			"data4": "テスト",
			"data5": "テスト",
			"data6": "テスト",
			"data7": "テスト",
		}, keyCountor)
	}
}

// func BenchmarkPick(b *testing.B) {
//   sortKeys := []string{"a", "b", "c", "d", "e"}
//   keys := []string{"e", "c", "b", "a", "d"}
//   result := make([]int, 5)
//   for i := 0; b.N > i; i ++ {
//     for j, sk := range sortKeys {
//       for _, k := range keys {
//         if sk == k {
//           result[i] = j
//           break
//         }
//       }
//     }
//   }
// }

// func BenchmarkMap(b *testing.B) {
//   a := interface{}("ばばば")
//   var bs []byte
//   var r []rune
//   for i := 0; b.N > i; i ++ {
//
//     bs = []byte(a.(string))
//     r = []rune(a.(string))
//   }
//   _ = len(bs)
//   _ = len(r)
// }
