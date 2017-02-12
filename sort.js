// 常见排序算法

(function(global) {
    'use strict';

    if (global.sortUtil) {
        return;
    }

    // 判断数组
    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }


    // 插入排序
    function insert(arr, cmp) {
        if (isArray(arr)) {
            for (var i = 1, len = arr.length; i < len; i++) {
                var tmp = arr[i];

                for (var j = i - 1; j >= 0 && cmp(arr[j], tmp) > 0; j--) {
                    arr[j + 1] = arr[j];
                }
                arr[j + 1] = tmp;
            }

            return arr;
        } else {
            throw new TypeError('arr is not an Array!');
        }
    }


    // 快速排序
    function quick(arr, cmp) {
        if (isArray(arr)) {
            var len = arr.length;

            var helper = function(left, right) {
                if (left >= right || right >= len || left < 0) {
                    return;
                }

                var pivot = arr[left];
                var pivotIndex = left;

                swap(left, right);
                for (var i = left; i < right; i++) {
                    if (cmp(arr[i], pivot) < 0) {
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
            throw new TypeError('arr is not an Array!');
        }
    }


    // 希尔排序
    function shell(arr, cmp) {
        if (isArray(arr)) {
            var len = arr.length,
                tmp,
                gap = 1;

            while (gap < len / 3) {
                gap = gap * 3 + 1;
            }

            while (gap > 0) {
                for (var i = gap; i < len; i++) {
                    tmp = arr[i];

                    for (var j = i - gap; j >= 0 && cmp(arr[j], tmp) > 0; j -= gap) {
                        arr[j + gap] = arr[j];
                    }

                    arr[j + gap] = tmp;
                }
                gap = Math.floor(gap - 1 / 3);
            }

            return arr;
        } else {
            throw new TypeError('arr is not an Array!');
        }
    }


    // 堆排序
    function heap(arr, cmp) {
        if (isArray(arr)) {
            var size = arr.length;
            var tmp;
            var heapify = function(root ,heapSize) {
                var left = root * 2 + 1,
                    right = root * 2 + 2,
                    largest = root,
                    tmp;

                if (left < heapSize && cmp(arr[left], arr[largest]) > 0) {
                    largest = left;
                }

                if (right < heapSize && cmp(arr[right], arr[largest]) > 0) {
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
            throw new TypeError('arr is not an Array!');
        }
    }


    // 归并排序
    function merge(arr, cmp) {
        if (isArray(arr)) {
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
                    lenr = right.length,
                    i = 0,
                    j = 0;

                while (i < lenl && j < lenr) {
                    if (cmp(left[i], right[j]) > 0) {
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
            throw new TypeError('arr is not an Array!');
        }
    }


    // 桶排序
    function bucket(arr, num) {
        if (isArray(arr)) {
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
                result = result.concat(insert(buckets[j], function(a, b) {
                    return a - b;
                }));
                j++;
            };

            return result;
        } else {
            throw new TypeError('arr is not an Array!');
        }
    }


    global.sortUtil = {
        'insert': insert,
        'quick': quick,
        'shell': shell,
        'heap': heap,
        'merge': merge,
        'bucket': bucket
    };
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);


// 测试
var array = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
// 比较函数
var compare = function(a, b) {
    return a - b;
};
console.log(sortUtil.insert(array, compare));
console.log(sortUtil.quick(array, compare));
console.log(sortUtil.shell(array, compare));
console.log(sortUtil.heap(array, compare));
console.log(sortUtil.merge(array, compare));
console.log(sortUtil.bucket(array, 5));
