import random
import math
import enum

from enum import Enum

class UniversalHashType(Enum):
    OriginalInt = 1
    FastInt = 2

class UniversalHash(object):
    """
    Universal hashing for integers:\n
    h(x,a,b) = ((ax + b) mod p) mod m\n
    x is key you want to hash\n
    a is any number you can choose between 1 to p-1 inclusive\n
    b is any number you can choose between 0 to p-1 inclusive\n
    p is a prime number that is greater than max possible value of x\n
    m is a max possible value you want for hash code + 1\n
    \n
    (unsigned) (aa*x + bb) >> (w - m)\n
    w is size of machine word\n
    m is size of hash code you want in bits\n
    aa is any odd integer that fits in to machine word\n
    bb is any integer less than 2^(w - m)
    """
    
    _range = None
    _type = None

    _prime = 29996224275833
    _a = None
    _b = None
    
    _w = 64
    _aa = None
    _bb = None
    _m = None
    _rrange = None

    def __init__(self, hash_range = None, hash_type = UniversalHashType.FastInt):
        self._range = hash_range
        self._type = hash_type

        if self._type == UniversalHashType.OriginalInt:
            self._a = random.randint(1, self._prime - 1)
            self._b = random.randint(0, self._prime - 1)
        elif self._type == UniversalHashType.FastInt:
            self._m = 1
            self._rrange = 2
            while self._rrange < hash_range:
                self._m += 1
                self._rrange *= 2
            self._aa = random.getrandbits(self._w) | 1
            self._bb = random.getrandbits(self._w - self._m)
    
    def hash_value(self, key):
        if self._type == UniversalHashType.OriginalInt:
            return ((self._a * key + self._b) % self._prime) % self._range
        elif self._type == UniversalHashType.FastInt:
            return ((self._aa * key + self._bb) >> (self._w - self._m)) % self._range        

class FO(object):
    _eps = 1.0
    _exp = None

    def __init__(self, eps):
        self._eps = eps
        self._exp = math.exp(eps)
    
    def encoder(self, value):
        raise NotImplementedError

    def frequency_estimator(self, value, *reports):
        raise NotImplementedError

class FOOLH(FO):
    _g = None    
    _pp = None
    _qq = None

    def __init__(self, eps, hash_range = None):
        super().__init__(eps)
        if hash_range is None:
            self._g = int(math.exp(eps) + 1 + 0.5)
        else:
            self._g = hash_range
        self._pp = self._exp / (self._exp + self._g - 1)
        self._qq = 1 / self._g

    def encoder(self, value):
        h = UniversalHash(self._g)
        x = h.hash_value(value)
        if (random.random() < (self._exp - 1)/(self._exp + self._g - 1)):
            return (h, x)
        else:
            return (h, random.randint(0, self._g - 1))
    
    def frequency_estimator(self, value, reports):
        report_eval = [report[0].hash_value(value) == report[1] for report in reports]
        est_with_bias = report_eval.count(True)
        return (est_with_bias - len(reports) * self._qq) / (self._pp - self._qq)

class FOAoN(FO):
    _m = None
    _hash_range = 10000000
    _hash_threshold = None
    _bias = None
    _coff = None

    def __init__(self, eps, hash_m = None):
        super().__init__(eps)
        if hash_m is None:
            self._m = math.exp(eps / 2) + 1
        else:
            self._m = hash_m
        self._hash_threshold = self._hash_range / self._m
        self._bias = (self._exp + self._m - 1) / (self._m * self._m * self._exp)
        self._coff = (self._m * self._m * self._exp) / ((self._m - 1) * (self._exp - 1))

    def encoder(self, value):
        h = UniversalHash(self._hash_range)
        x = h.hash_value(value)
        if x < self._hash_threshold:
            return h
        else:
            if (random.random() < 1 / self._exp):
                return h
            else:
                return None

    def frequency_estimator(self, value, reports):
        report_eval = [report is not None and report.hash_value(value) < self._hash_threshold for report in reports]
        est_with_bias = report_eval.count(True)
        return (est_with_bias - len(reports) * self._bias) * self._coff


class FOTester(object):
    _data = []

    def __init__(self, num_rows):
        self._data = [int(random.gauss(num_rows, num_rows**(0.1))) for _ in range(num_rows)]
    
    def table_stat(self):
        num_rows = len(self._data)        
        print("Frequency of mean:", self._data.count(num_rows))
        print("Min value:", min(self._data))
        print("Max value:", max(self._data))
    
    def test_fo_it(self, fo):
        encoded_data = [fo.encoder(t) for t in self._data]
        for t in range(min(self._data), max(self._data) + 1):
            print("%d:\t%d\t%0.3lf" % (t, self._data.count(t), fo.frequency_estimator(t, encoded_data)))

    def test_fo(self, fo, test_round = 20):
        avg_error = []
        max_error = []
        for _ in range(test_round):
            encoded_data = [fo.encoder(t) for t in self._data]
            freq = [(self._data.count(t), fo.frequency_estimator(t, encoded_data)) for t in range(min(self._data), max(self._data) + 1)]
            avg_e = sum([math.fabs(t[0] - t[1]) for t in freq]) / len(freq)
            max_e = max([math.fabs(t[0] - t[1]) for t in freq])
            avg_error.append(avg_e)
            max_error.append(max_e)
        print("Expected avg error: %0.2lf" % (sum(avg_error) / len(avg_error)))
        print("Expected max error: %0.2lf" % (sum(max_error) / len(max_error)))

tester = FOTester(10000)
olh = FOOLH(1.0)
aon = FOAoN(1.0)
tester.test_fo_it(olh)
tester.test_fo_it(aon)
tester.test_fo(olh)
tester.test_fo(aon)

