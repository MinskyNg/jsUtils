// 常见排序实现

var sortUtil = {
    // 判断数组
    isArray: function(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },

    // 插入排序
    insert: function(arr) {
        if (sortUtil.isArray(arr)) {
            for (var i = 1, len = arr.length; i < len; i++) {
                var tmp = arr[i];

                for (var j = i - 1; j >= 0 && arr[j] > tmp; j--) {
                    arr[j + 1] = arr[j];
                }
                arr[j + 1] = tmp;
            }

            return arr;
        } else {
            console.log('arr is not an Array!');
            return;
        }
    },


    // 快速排序
    quick: function(arr) {
        if (sortUtil.isArray(arr)) {
            var len = arr.length;

            var helper = function(left, right) {
                if (left >= right || right >= len || left < 0) {
                    return;
                }

                var pivot = arr[left];
                var pivotIndex = left;

                swap(left, right);
                for (var i = left; i < right; i++) {
                    if (arr[i] < pivot) {
                        if (i !== pivotIndex) {
                            swap(i, pivotIndex);
                        }
                        pivotIndex++;
                    }
                }
                swap(pivotIndex, right);

                if (pivotIndex > left) {
                    helper(left, pivotIndex - 1);
                }

                if (pivotIndex < right) {
                    helper(pivotIndex + 1, right);
                }
            };

            var swap = function(i, j) {
                var tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
            }

            helper(0, len - 1);
            return arr;
        } else {
            console.log('arr is not an Array!');
            return;
        }
    },


    // 希尔排序
    shell: function(arr) {
        if (sortUtil.isArray(arr)) {
            var len = arr.length,
                tmp,
                gap = 1;

            while (gap < len / 5) {
                gap = gap * 5 + 1;
            }

            while (gap > 0) {
                for (var i = gap; i < len; i++) {
                    tmp = arr[i];

                    for (var j = i - gap; j >= 0 && arr[j] > tmp; j -= gap) {
                        arr[j + gap] = arr[j];
                    }

                    arr[j + gap] = tmp;
                }
                gap = Math.floor(gap / 5);
            }

            return arr;
        } else {
            console.log('arr is not an Array!');
            return;
        }
    },


    // 堆排序
    heap: function(arr) {
        if (sortUtil.isArray(arr)) {
            var size = arr.length;
            var tmp;
            var heapify = function(root ,heapSize) {
                var left = root * 2 + 1,
                    right = root * 2 + 2,
                    largest = root,
                    tmp;

                if (left < heapSize && arr[left] > arr[largest]) {
                    largest = left;
                }

                if (right < heapSize && arr[right] > arr[largest]) {
                    largest = right;
                }

                if (largest !== root) {
                    tmp = arr[root];
                    arr[root] = arr[largest];
                    arr[largest] = tmp;
                    heapify(largest, size);
                }
            };


            for (var i = Math.floor(size / 2) - 1; i >= 0; i--) {
                heapify(i, size);
            }

            while (size > 0) {
                size--;
                tmp = arr[0];
                arr[0] = arr[size];
                arr[size] = tmp;
                heapify(0, size);
            }

            return arr;
        } else {
            console.log('arr is not an Array!');
            return;
        }
    },


    // 归并排序
    merge: function(arr) {
        if (sortUtil.isArray(arr)) {
            var helper = function(arr) {
                if (arr.length < 2) {
                    return arr;
                }

                var middle = Math.floor(arr.length / 2);
                return merge(helper(arr.slice(0, middle)), helper(arr.slice(middle)));
            };

            var merge = function(left, right) {
                var result = [],
                    lenl = left.length,
                    lenr = right.length;
                    i = 0;
                    j = 0;

                while (i < lenl && j < lenr) {
                    if (left[i] > right[j]) {
                        result.push(right[j]);
                        j++;
                    } else {
                        result.push(left[i]);
                        i++
                    }
                }

                while (i < lenl) {
                    result.push(left[i]);
                    i++;
                }

                while (j < lenr) {
                    result.push(right[j]);
                    j++;
                }

                return result;
            };

            return helper(arr);
        } else {
            console.log('arr is not an Array!');
            return;
        }
    },


    // 桶排序
    bucket: function(arr, num) {
        if (sortUtil.isArray(arr)) {
            if (arr.length < 2) {
                return arr;
            }

            num = num || 5;

            var len = arr.length,
                result = [],
                buckets = [],
                max = arr[0],
                min = arr[0];

            for (var i = 1; i < len; i++) {
                min = min < arr[i] ? min : arr[i];
                max = max > arr[i] ? max : arr[i];
            }

            var range = (max - min + 1) / num;

            for (i = 0; i < len; i++) {
                var index = Math.floor((arr[i] - min) / range);

                if (buckets[index]) {
                    buckets[index].push(arr[i]);
                } else {
                    buckets[index] = [arr[i]];
                }
            }

            var j = 0;
            while (j < num) {
                result = result.concat(sortUtil.insert(buckets[j]));
                j++;
            };

            return result;
        } else {
            console.log('arr is not an Array!');
            return;
        }
    }
};


// 测试
var array = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
console.log(sortUtil.insert(''));
console.log(sortUtil.insert(array));
console.log(sortUtil.quick(array));
console.log(sortUtil.shell(array));
console.log(sortUtil.heap(array));
console.log(sortUtil.merge(array));
console.log(sortUtil.bucket(array, 5));
